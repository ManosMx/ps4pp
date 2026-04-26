import * as Sentry from "@sentry/nextjs";
import type { NextPage } from "next";
import type { ErrorProps } from "next/error";
import NextError from "next/error";

const CustomError: NextPage<ErrorProps> = ({ statusCode }) => {
  return <NextError statusCode={statusCode} />;
};

CustomError.getInitialProps = async (contextData) => {
  await Sentry.captureUnderscoreErrorException(contextData);
  return NextError.getInitialProps(contextData);
};

export default CustomError;
