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



/**
 * @desc Recursively fetch all items in a list query using nextToken
 * @param {Object} query The query object from cda-graphql in use.
 * @param {Object} variables The variables to pass to query.
 * @param {Array} items Any preliminary Items already fetched
 * @param {Function} callback Optional callback function to be fired with every batch of items from query iteration.
 * @returns {Array} Array of all items received from queries.
 * Copied from https://medium.com/swlh/how-to-really-use-aws-amplify-fcb4c5ed769c
*/
export async function fetchItemsNextToken({ query, variables, items = [], callback = undefined }) {
  const { data } = await API.graphql(graphqlOperation(query, variables));
  const key = Object.keys(data).find(k => k.includes('list'));
  const res = data[key]; // res = { items: [], nextToken: '' }

  items.push(...res.items);
  if (callback) {
    callback(res.items);
  }
  if (!res.nextToken) return items;

  // eslint-disable-next-line no-param-reassign
  variables.nextToken = res.nextToken;
  return fetchItemsNextToken({ query, variables, items, callback });
}
