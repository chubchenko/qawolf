import {
  ApolloClient,
  ApolloLink,
  HttpLink,
  InMemoryCache,
} from "@apollo/client";
import { onError } from "@apollo/link-error";

import { isServer } from "./detection";
import { state } from "./state";

export const JWT_KEY = "qaw_token";
const VERSION_KEY = "qaw_version";

// these errors we handle with custom ui
const ERROR_OPERATION_DENYLIST = ["sendLoginCode", "signInWithEmail"];

const isDevelopment = process.env.NEXT_PUBLIC_ENV === "development";

const errorLink = onError(({ graphQLErrors, networkError, operation }) => {
  if (networkError) {
    // include errors in console logs so that we can help users debug
    console.warn("qawolf:", networkError);
    if (isDevelopment) {
      state.setToast({
        error: true,
        message: `Network error: ${networkError}`,
      });
    }
  }

  if (graphQLErrors) {
    graphQLErrors.forEach(({ message }) => {
      const formattedMessage = message.replace("Context creation failed: ", "");

      const error = isDevelopment
        ? `Error (${operation.operationName}): ${formattedMessage}`
        : `Error: ${formattedMessage}`;

      console.warn("qawolf:", error);

      if (!ERROR_OPERATION_DENYLIST.includes(operation.operationName)) {
        state.setToast({ error: true, message: error });
      }
    });
  }
});

const httpLink = new HttpLink({
  headers: {
    authorization: isServer() ? null : localStorage.getItem(JWT_KEY),
  },
  uri: "/api/graphql",
});

const versionLink = new ApolloLink((operation, forward) => {
  return forward(operation).map((response) => {
    const context = operation.getContext();

    const serverVersion = context.response?.headers?.get("version");

    let clientVersion = sessionStorage.getItem(VERSION_KEY);
    if (!clientVersion || serverVersion !== clientVersion) {
      sessionStorage.setItem(VERSION_KEY, serverVersion);
    }

    if (clientVersion && serverVersion !== clientVersion) {
      window.location.reload();
    }

    return response;
  });
});

export const client = new ApolloClient({
  cache: new InMemoryCache({
    typePolicies: {
      TestTriggers: {
        keyFields: ["test_id"],
      },
    },
  }),
  link: errorLink.concat(versionLink).concat(httpLink),
});
