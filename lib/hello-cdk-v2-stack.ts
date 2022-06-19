import {
  Stack,
  StackProps,
  aws_s3 as s3,
  RemovalPolicy,
  Duration,
} from "aws-cdk-lib";
import { Construct } from "constructs";
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class HelloCdkV2Stack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // バケット
    new s3.Bucket(this, "S3Bucket", {
      bucketName: "sample-backet-from-typescript",
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
    });

    // The code that defines your stack goes here

    // example resource
    // const queue = new sqs.Queue(this, 'HelloCdkV2Queue', {
    //   visibilityTimeout: cdk.Duration.seconds(300)
    // });
  }
}
