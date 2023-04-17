import {API, Auth} from 'aws-amplify';
import translate from 'google-translate-api-x';


/************** USERS API ***************/ 

export interface User {
  username: string,
  deviceEndpoint: string,
  email: string,
  allergens?: Array<string>,
  scans?: Array<object>
}

interface UpdatableUserData extends User {
  deviceEndpoint: string,
  allergens?: Array<string>,
  scan?: object,
  receive_notifications?: Boolean,
  product_id?: string
}

export async function postNewUser({username, deviceEndpoint, email, allergens} : User) {
  API.post('myAPI', '/users', {
    body: {
      Item: {username: username, deviceEndpoint: deviceEndpoint, email: email, allergens: allergens, hasCompletedSetup: true, scans: {}},
    },
    headers: {
      'Content-Type': 'application/json',
      Authorization: `${(await Auth.currentSession())
        .getIdToken()
        .getJwtToken()}`,
    },
  })
    .then(res => {
      return res;
    })
    .catch(err => {
      return err;
    });
}

export async function deleteUser({username, email} : User) {
  API.del('myAPI', '/users', {
    body: {
      Key: {username: username, email: email},
    },
    headers: {
      'Content-Type': 'application/json',
      Authorization: `${(await Auth.currentSession())
        .getIdToken()
        .getJwtToken()}`,
    },
  })
    .then(res => {
      return res;
    })
    .catch(err => {
      return err;
    });
}

export async function updateUser({username, email, allergens, deviceEndpoint, scan, receive_notifications, product_id}: UpdatableUserData){
  /*
  * Calls to update user information in dynamodb
  *
  * this can be:
  *   - allergens e.g. changed from profile
  *   - turning on/off notifications for certain products either from scan result or scan history
  *   - a new scan result of a product when scanned or read from search results or scan history
  * */


  let requestBody;
  if (allergens) {
    requestBody = {
      Key: {username: username, email: email},
      UpdateExpression: 'set allergens = :allergen_list',
      ExpressionAttributeValues: {
        ':allergen_list': allergens,
      },
      ReturnValues: 'UPDATED_NEW',
    };
  }
  else if (receive_notifications === false || receive_notifications === true) {
    requestBody = { 
      Key: {username: username, email: email},
      UpdateExpression: 'set scans.#product.receive_notifications = :new_boolean',
      ExpressionAttributeValues: {
        ':new_boolean': receive_notifications,
      },
      ExpressionAttributeNames: {
        '#product': product_id,
      },
      ReturnValues: 'UPDATED_NEW',
    };
  }
  else if (scan) {
    // user.scans = {'1': {}, '2'={}}
    // if product_id in user.scans: update that scan
    // else append to user.scans

    requestBody = {
      Key: {username: username, email: email},
      UpdateExpression: `set #scans.#product = :scanResult`, // ${scan.product_id}
      ExpressionAttributeValues: {
        ':scanResult': Object.values(scan)[0],
      },
      ExpressionAttributeNames: {
        '#scans': "scans",
        '#product': Object.keys(scan)[0],
      },
      ReturnValues: 'UPDATED_NEW',
    }
  }
  else {
    return "errorUpdate"
  }

  // update user information based on body
  API.put('myAPI', '/users', {
    body: requestBody,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `${(await Auth.currentSession())
        .getIdToken()
        .getJwtToken()}`,
    },
  })
    .then(res => {
      return res;
    })
    .catch(err => {
      return err;
    });
}

export async function getSingleUser({username, email} : User) {
  /* Gets a single user based on their username and email from dynamodb */

  return (
    API.get('myAPI', '/users', {
      queryStringParameters: {
        username: username,
        email: email,
      },
      headers: {
        'Content-Type': 'application/json',
        Authorization: `${(await Auth.currentSession())
          .getIdToken()
          .getJwtToken()}`,
      },
    })
    .then(res => {
      if (Object.keys(res).length > 0){
        delete res.Item.username;
        return {[username]: res.Item};
      }
      else {
        return res;
      }
    })
    .catch(err => {
      return err;
    })
  )
}

export async function getAllUsers() {
  API.get('myAPI', '/users', {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `${(await Auth.currentSession())
          .getIdToken()
          .getJwtToken()}`,
    },
  })
  .then(res => {
    return res;
  })
  .catch(err => {
    return err;
  });
}

/************** REPORTS API ***************/ 

export interface Report {
  productId: string,
  productName: string,
  username?: string,
  suspectedAllergens?: Array<string>,
}

export async function addReportToDynamo({productId, productName, username, suspectedAllergens} : Report) {
  /*
  * Creates a new report of product in DynamooDB within a list if not existing already,
  * otherwise appends it to the list of reports of the product
  * */

  // check if product already has been reported
  let reportObj : Report = {productId: productId};
  let getReportsResponse = await getProductReports(reportObj);

  // if product has never been reported before, POST new report to DynamoDB
  if (Object.keys(getReportsResponse).length == 0){
    API.post('myAPI', '/reportsLambda-dev', {
      body: {
        Item: {product_id: productId, product_name: productName, reports: [{suspected_allergens: suspectedAllergens, user_id: username, date: new Date()}]},
      },
      headers: {
        'Content-Type': 'application/json',
        Authorization: `${(await Auth.currentSession())
          .getIdToken()
          .getJwtToken()}`,
      },
    })
      .then(res => {
        return res;
      })
      .catch(err => {
        return err;
      });
  }
  else {
    // else, product is already in reports table, so PUT/append new report

    // check if user has already submitted a report for this product.
    if (getReportsResponse['Item']['reports'].find(r => r.user_id == username)){
      // User already reported
      return;
    }
    else {
      // add report to DynamoDB in a list of reports for that product
      API.put('myAPI', '/reportsLambda-dev', {
        body: {
          Key: {product_id: productId},
          UpdateExpression: `set reports = list_append(if_not_exists(reports, :emptyReportsList), :addReport)`,
          ExpressionAttributeValues: {
            ':addReport': [{
              "suspected_allergens": suspectedAllergens,
              "user_id": username,
              "date": new Date(),
            }],
            ':emptyReportsList': []
          },
          ReturnValues: 'UPDATED_NEW',
          ReportData: {product_name: productName, report: {suspected_allergens: suspectedAllergens, user_id: username, date: new Date()}}
        },
        headers: {
          'Content-Type': 'application/json',
          Authorization: `${(await Auth.currentSession())
              .getIdToken()
              .getJwtToken()}`,
        },
      })
      .then(res => {
        return res;
      })
      .catch(err => {
        return err;
      });
    }
  }
}

export async function getProductReports({productId} : Report) {
  /*
  * Gets the list of reports of a product based on its id/barcode
  * */

  return (
    API.get('myAPI', '/reportsLambda-dev', {
    queryStringParameters: {
      product_id : productId
    },
    headers: {
      'Content-Type': 'application/json',
      Authorization: `${(await Auth.currentSession())
        .getIdToken()
        .getJwtToken()}`,
    },
    })
    .then(res => {
      return res;
    })
    .catch(err => {
      return err;
    })
  )
}

export async function deleteProductReport({productId} : Report, index) {
  /*
  * Deletes a single report from the list of reports of a product based on its index in DynamoDB
  * */
  API.put('myAPI', '/reportsLambda-dev', {
    body: {
      Key: {product_id: productId},
      UpdateExpression: "REMOVE reports["+index+"]",
      ReturnValues: 'UPDATED_NEW',
    },
    headers: {
      'Content-Type': 'application/json',
      Authorization: `${(await Auth.currentSession())
          .getIdToken()
          .getJwtToken()}`,
    },
  })
      .then(res => {
        return res;
      })
      .catch(err => {
        return err;
      });
}

/************** NOTIFICATIONS API ***************/ 

export interface NotificationObj {
  productId: string,
  user_endpoint?: string
}

export interface UpdatableNotificationObj extends NotificationObj {
  productId: string,
  user_endpoint: string
}

export async function addNotificationsToDynamo({productId, user_endpoint} : UpdatableNotificationObj) {
  /*
  * Adds new notification to in the notifications table based on productId,
  * used by SNS to publish mobile notifications to each user,
  * either creating a new row containing a list in dynamodb based on that productId with the user endpoint,
  * or appending the user endpoint to the list in the row of the productId
  *  */

  // check if product already has been reported
  let notifyObj : NotificationObj = {productId: productId};
  let notificationResponse = await getProductNotifications(notifyObj);

  // if product isn't in notifications table yet, POST new to DynamoDB
  if (Object.keys(notificationResponse).length == 0){
    API.post('myAPI', '/notificationsLambda-dev', {
      body: {
        Item: {product_id: productId, user_endpoints: [user_endpoint]},
      },
      headers: {
        'Content-Type': 'application/json',
        Authorization: `${(await Auth.currentSession())
          .getIdToken()
          .getJwtToken()}`,
      },
    })
      .then(res => {
        return res;
      })
      .catch(err => {
        return err;
      });
  }
  else{
    // else, product is already in notifications table, so PUT/append new user endpoint
    
    // add user_endpoint to product notifications to DynamoDB based on productId
    API.put('myAPI', '/notificationsLambda-dev', {
      body: {
        Key: {product_id: productId},
        UpdateExpression: `ADD user_endpoints :endpoint`,
        ExpressionAttributeValues: {
          ':endpoint': [user_endpoint]
        },
        ReturnValues: 'UPDATED_NEW',
      },
      headers: {
        'Content-Type': 'application/json',
        Authorization: `${(await Auth.currentSession())
          .getIdToken()
          .getJwtToken()}`,
      },
    })
      .then(res => {
        return res;
      })
      .catch(err => {
        return err;
      });
  }
}

export async function deleteNotificationsFromDynamo({productId, user_endpoint} : UpdatableNotificationObj) {
  /*
   * Deletes the user's endpoint from the notifications table for a certain product,
   * to prevent SNS messaging the user about the product
  */
  
  // add user_endpoint to product notifications to DynamoDB
  API.put('myAPI', '/notificationsLambda-dev', {
    body: {   
      Key: {product_id: productId},
      UpdateExpression: `DELETE user_endpoints :endpoint`,
      ExpressionAttributeValues: {
        ':endpoint': [user_endpoint]
      },
      ReturnValues: 'UPDATED_NEW',
    },
    headers: {
      'Content-Type': 'application/json',
      Authorization: `${(await Auth.currentSession())
        .getIdToken()
        .getJwtToken()}`,
    },
  })
    .then(res => {
      return res;
    })
    .catch(err => {
      return err;
    });
}

export async function getProductNotifications({productId} : Report) {
  /*
  * Gets the endpoints subscribed for notifications of a product
  * */

  return (
    API.get('myAPI', '/notificationsLambda-dev', {
    queryStringParameters: {
      product_id: productId
    },
    headers: {
      'Content-Type': 'application/json',
      Authorization: `${(await Auth.currentSession())
        .getIdToken()
        .getJwtToken()}`,
    },
    })
    .then(res => {
      return res;
    })
    .catch(err => {
      return err;
    })
  )
}

export async function registerDeviceToken(token: string) {
  /*
  * Required for mobile push notifications, device token is retrieved from Firebase Cloud Messaging service,
  * once the user in the frontend receives it, they will give it to SNS via this API call
  *  */

  return (
    API.post("myAPI", "/register-device-token", {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `${(await Auth.currentSession())
            .getIdToken()
            .getJwtToken()}`,
      },
      body: {httpMethod: "POST", token: token}
    })
    .then(res => {
      return res;
    })
    .catch(err => {
      return err;
    })
  )
}

export function getInitialNotificationState(productId: string, scans: object) {
  if (scans != null && Object.keys(scans).includes(productId)){
      return scans[productId].receive_notifications;
  }
  else {
      return true;
  }
}


/************** OCR PRE-PROCESSING ***************/
export async function ocrPreprocessing(base64Image: string) {
  /* Sends image retrieved for OCR to a lambda function using opencv via API call for preprocessing */

  return (
    API.post("myAPI", "/ocr-preprocessing", {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `${(await Auth.currentSession())
            .getIdToken()
            .getJwtToken()}`,
      },
      body: base64Image
    })
    .then(res => {
      return res.body;
    })
    .catch(err => {
      return err;
    })
  );
}

/************** OPEN FOOD FACTS ***************/

export interface SearchQuery {
  queryString?: string | null,
  page?: number,
  searchTerms?: string,
  allergensContains?: Array<string>,
  allergensNotContains?: Array<string>
}

// OFF helper functions for API calls

const calculateTotalPages = (totalProducts: number, pageSize: number) => {
  // for search results pagination

  const maxOFFPageSize = 1000;
  let result = Math.ceil(totalProducts / pageSize);

  if (result == 0){
    result += 1;
  }

  if (result > maxOFFPageSize) {
    return maxOFFPageSize;
  }

  return result;
}

const getProductDisplayName = (productName: string, brandsList: Array<string>, quantity : string) => {
  // gets readable name of product

  let productDisplayName = "";
  productDisplayName += productName ? productName : "";

  if (brandsList?.length > 0){
    if (productDisplayName !== "") {
      productDisplayName += " - "
    }

    productDisplayName += brandsList[0].charAt(0).toUpperCase() + brandsList[0].slice(1);
  }

  if (productDisplayName === ""){
    productDisplayName += "Product Name Unavailable"
  }

  productDisplayName += quantity ? " - " + quantity.replace(" ", "") : "";

  //remove unnecessary punctuation from product name
  productDisplayName = productDisplayName.replace(/[.,\/#!$%\^&\*;:{}=\_`~()]/g,"")
      .replace(/\s{2,}/g," ");

  return productDisplayName;
}

function mergeAllergenStringsToList(s1: string, s2: string){
  let s1List = s1 !== "" ? s1.split(",") : [];
  let s2List = s2 !== "" ? s2.split(",") : [];
  let merged_list = s1List.concat(s2List)

  return merged_list;
}

function compileBarcodeResult(data : object, barcodeText : string | null = null) {
  // compiles results coming from an API call to OFF of a product


  if (data?.status_verbose === "product not found"){
    return {
      "status": data?.status_verbose,
      "product_code": barcodeText == null ? data?.product?.code : barcodeText,
    }
  }
  else {
    return {
      "product_display_name": getProductDisplayName(data?.product?.product_name, data?.product?.brands_tags, data.product?.quantity),
      "date": new Date().toISOString(),
      "status": data?.status_verbose,
      "product_code": barcodeText == null ? data?.product?.code : barcodeText,
      "product_name": data?.product?.product_name,
      "product_image": data?.product?.image_front_url,
      "ingredients_image": data?.product?.image_ingredients_thumb_url,
      "ingredients_text": data?.product?.ingredients_text,
      "ingredients_complete_boolean": data?.product?.states_hierarchy.includes("en:ingredients-completed"),
      "allergens": mergeAllergenStringsToList(data?.product?.allergens, data?.product?.allergens_from_ingredients),
      "may_contain": data?.product?.traces ? data?.product?.traces.replace("en:", "").replace(" ", "") : "",
      "traces_tags": data?.product.traces_tags,
      "missing_ingredients": data?.product?.unknown_ingredients_n,
      "non_vegan_ingredients": data?.product?.ingredients_analysis?.["en:non-vegan"],
      "vegan_status_unknown_ingredients": data?.product?.ingredients_analysis?.["en:vegan-status-unknown"],
      "vegetarian_status_unkown_ingredients": data?.product?.ingredients_analysis?.["en:vegetarian-status-unknown"],
    }
  } 
}

// OFF API calls

export async function scanBarcode(barcodeText: string) {
  // get product from OFF if available

  return fetch(`https://world.openfoodfacts.org/api/v2/product/${barcodeText}.json`, {
    method: "GET",
    headers: {
      'Content-Type': 'application/json'
    }
  }).then(res => {
    return res.json().then(async (data) => {
      return compileBarcodeResult(data, barcodeText);
    })
    }).catch(err => {
      return err;
    });
}

export async function facetedProductSearch({queryString = null, page = 1, searchTerms = "", allergensContains, allergensNotContains}: SearchQuery) {
  // for searching products from the OFF database

  let OFFSearchQueryUrl : string;
  let parameters = ""
  // let tagCount = 0;

  if (queryString == null) {
    if (searchTerms !== "") {
      parameters += `&search_terms2=${searchTerms}`;
    }

    // DEPRECATED - OFF is not good enough yet at faceted search in a lot of cases, reconsider use in future

    // if (brand !== "") {
    //   parameters += `&tagtype_${tagCount}=brands&tag_contains_${tagCount}=contains&tag_${tagCount}=${brand}`;
    //   tagCount++;
    // }

    // if (category !== "") {
    //   parameters += `&tagtype_${tagCount}=categories&tag_contains_${tagCount}=contains&tag_${tagCount}=${category}`;
    //   tagCount++;
    // } 

    // for (let allergenContains of allergensContains) {
    //   parameters += `&tagtype_${tagCount}=allergens&tag_contains_${tagCount}=contains&tag_${tagCount}=${allergenContains}`
    //   tagCount++;
    // }
    // for (let allergenNotContains of allergensNotContains) {
    //   parameters += `&tagtype_${tagCount}=allergens&tag_does_not_contain_${tagCount}=does_not_contain&tag_${tagCount}=${allergenNotContains}`
    //   tagCount++;
    // }

    OFFSearchQueryUrl = `https://world.openfoodfacts.org/cgi/search.pl?action=process${parameters}&page_size=25&json=true`;
  }
  else {
    OFFSearchQueryUrl = queryString;
  }

  return fetch(`${OFFSearchQueryUrl}&page=${page}`, {
    method: "GET",
    headers: {
      'Content-Type': 'application/json'
    }
  }).then(res => {

    return res.json().then(async (res) => {
      let products = [];
      for (let product of res?.products) {
        products.push({
          barcode: product?.code,
          product_display_name: getProductDisplayName(product.product_name, product.brands_tags, product.quantity),
          image_url: product?.image_url,
          productResults: compileBarcodeResult({product: product})
        })
      }
    
      return {query: OFFSearchQueryUrl, pages: calculateTotalPages(res.count, 25), products: products};
    })
    }).catch(err => {
      return err;
    });
}
