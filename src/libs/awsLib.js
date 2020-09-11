import { API, Storage, graphqlOperation, Auth } from "aws-amplify";
import * as mutations from "../graphql/mutations";
import config from "../config";

// eslint-disable-next-line import/prefer-default-export
export function deleteSearch(search) {
  const { id } = search;
  API.graphql(
    graphqlOperation(mutations.deleteSearch, { input: { id } })
  );

  Storage.remove(`${search.searchDir}/${search.upload}`, {
    level: "private",
    bucket: config.SEARCH_BUCKET
  });
}

export function signedLink(url) {
  const downloadOptions = {
    expires: 500,
    level: "private",
    bucket: config.SEARCH_BUCKET
  };

  return Storage.get(url, downloadOptions).then(result => result);
}

export function logSearchInfo(search) {
  Auth.currentCredentials().then(creds => {
    // eslint-disable-next-line no-console
    console.log(`Search: ${search.upload} - ${search.id}`);
    // eslint-disable-next-line no-console
    console.log(`\tFiles: https://s3.console.aws.amazon.com/s3/buckets/${config.SEARCH_BUCKET}/private/${creds.identityId}/${search.searchDir}/`);
  });
}
