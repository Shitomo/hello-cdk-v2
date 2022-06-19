import {
  Stack,
  StackProps,
  aws_s3 as s3,
  aws_datasync as datasync,
  aws_ec2 as ec2,
  aws_efs as efs,
  RemovalPolicy,
  Duration,
} from "aws-cdk-lib";
import "dotenv/config";
import { Construct } from "constructs";
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class HelloCdkV2Stack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    let vpc = ec2.Vpc.fromLookup(this, `${process.env.ENV}-vpc-for-efs`, {
      vpcId: `${process.env.VPC_ID}`,
    });

    // バケット
    const DataBacket = new s3.Bucket(
      this,
      `${process.env.ENV}-sample-backet-from-typescript-data`,
      {
        bucketName: "sample-backet-from-typescript-data",
        // Bucketへの直接アクセスを禁止
        accessControl: s3.BucketAccessControl.PRIVATE,
        // CDK Stack削除時にBucketも削除する
        removalPolicy: RemovalPolicy.DESTROY,
        //
        lifecycleRules: [
          {
            enabled: true,
            expiration: Duration.days(1),
          },
        ],
      }
    );

    // バケット
    const EnvBacket = new s3.Bucket(
      this,
      `${process.env.ENV}-sample-backet-from-typescript-env`,
      {
        bucketName: `${process.env.ENV}-sample-backet-from-typescript-env`,
        // Bucketへの直接アクセスを禁止
        accessControl: s3.BucketAccessControl.PRIVATE,
        // CDK Stack削除時にBucketも削除する
        removalPolicy: RemovalPolicy.DESTROY,
        //
        lifecycleRules: [
          {
            enabled: true,
            expiration: Duration.days(1),
          },
        ],
      }
    );

    /**
     * ECS
     */

    // Security Group form ECS
    const EcsSG = new ec2.SecurityGroup(
      this,
      `${process.env.ENV}-security-group-for-ecs`,
      {
        securityGroupName: `${process.env.ENV}-security-group-for-ecs`,
        vpc: vpc,
      }
    );

    // Security Group form EFS
    const EfsSG = new ec2.SecurityGroup(
      this,
      `${process.env.ENV}-security-group-for-efs`,
      {
        securityGroupName: `${process.env.ENV}-security-group-for-efs`,
        vpc: vpc,
      }
    );

    EfsSG.addIngressRule(
      EcsSG,
      ec2.Port.tcp(2049),
      "allow access from Ecs task"
    );

    // EFS
    const EnvEfs = new efs.FileSystem(this, `${process.env.ENV}-efs`, {
      fileSystemName: `${process.env.ENV}-efs`,
      vpc: vpc,
      encrypted: true,
      securityGroup: EfsSG,
    });

    // 環境変数ファイルのデータ同期
    const DataSync = new datasync.CfnTask(
      this,
      `${process.env.ENV}-datasync-env-s3-to-efs`,
      {
        sourceLocationArn: `arn:aws:s3:::${process.env.ENV}-sample-backet-from-typescript-env`,
        destinationLocationArn: `arn:aws:efs:::${process.env.ENV}-efs`,
      }
    );

    DataSync.addDependsOn(EnvBacket.node.defaultChild as s3.CfnBucket);
    DataSync.addDependsOn(EnvEfs.node.defaultChild as efs.CfnFileSystem);
  }
}
