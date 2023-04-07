import {API, Auth} from 'aws-amplify';
import userReducer from 'reducers/user-reducer';
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
  console.log({username: username, deviceEndpoint: deviceEndpoint, email: email, allergens: allergens, hasCompletedSetup: true, scans: {}});
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
      console.log('SUCCESS 200 USer created');
      console.log(res);
    })
    .catch(err => {
      console.log(err);
      console.log(err.response.data);
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
      console.log('SUCCESS 200 User deleted');
      console.log(res);
    })
    .catch(err => {
      console.log(err);
      console.log(err.response.data);
    });
}


export async function updateUser({username, email, deviceEndpoint: deviceEndpoint, allergens, scan, receive_notifications, product_id}: UpdatableUserData){// , {allergens = [], scans = []} : UpdatableUserData) {
  let requestBody;
  if (allergens) {
    console.log("data is allergens");
    requestBody = {
      Key: {username: username, email: email},
      UpdateExpression: 'set allergens = :allergen_list',
      ExpressionAttributeValues: {
        ':allergen_list': allergens,
      },
      ReturnValues: 'UPDATED_NEW',
    };
    console.log(requestBody); 
  } else if (receive_notifications === false || receive_notifications === true){
    console.log("data is notifications update.. "+ product_id);
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
  } else if (scan) {
    console.log("data is scan");
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
    console.log(scan);
    console.log(requestBody);
  } else {
    console.log("error");
    return "errorUpdate"
  }

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
      console.log('SUCCESS 200 User updated');
      // if (res.Item && Object.keys(res.Item).includes("scans")){
      //   console.log(Object.values(res.Item.scans));
      // }
    })
    .catch(err => {
      console.log(err);
      // console.log(err.response?.data);
    });
}

export async function getSingleUser({username, email} : User) {
  console.log('get users from dynamoDB...');
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
      console.log('SUCCESS 200');
      if (Object.keys(res).length > 0){
        delete res.Item.username;
        return {[username]: res.Item};
      } else {
        return res;
      }
    })
    .catch(err => {
      console.log(err);
      console.log(err.response.data);
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
    console.log('SUCCESS 200');
    console.log(res);
  })
  .catch(err => {
    console.log(err);
    console.log(err.response.data);
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
  // check if product already has been reported
  let reportObj2 : Report = {productId: productId};
  let getReportsResponse = await getProductReports(reportObj2);

  // const test = getReportsResponse["Item"]["reports"].length;
  // console.log("how many reports?  " + test);
  console.log("getResponse ->  " + JSON.stringify(getReportsResponse));
  // console.log("\n how many reports? = "+ getReportsResponse["Item"]["reports"]);

  // if product has never been reported before, POST new report new DynamoDB
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
        console.log('SUCCESS 200 Report created');
        console.log(res);
      })
      .catch(err => {
        console.log(err);
        console.log(err.response.data);
      });
  }
  else{
    // else, product is already in reports DB, so PUT/append new report
    console.log("Appending report to DB.");
    console.log(JSON.stringify(getReportsResponse['Item']['reports']));
    // check if user has already submitted a report for this product.
    if (getReportsResponse['Item']['reports'].find(r => r.user_id == username)){
      console.log("User already reported");
    }
    else {
      // add report to DynamoDB
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
            console.log('SUCCESS 200 Report updated');
            console.log(res);
          })
          .catch(err => {
            console.log(err);
            console.log(err.response.data);
          });
    }
  }
}

export async function getProductReports({productId} : Report) {
  console.log('get report from dynamoDB...');
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
      console.log('SUCCESS 200');
      console.log(res);
      return res;
    })
    .catch(err => {
      console.log(err);
      console.log(err.response.data);
      
    })
  )
}

export async function deleteProductReport({productId} : Report, index) {
  console.log('deleting report from dynamoDB...');
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
        console.log('SUCCESS 200 Report deleted');
        console.log(res);
      })
      .catch(err => {
        console.log(err);
        console.log(err.response.data);
      });
}

/************** NOTIFICATIONS API ***************/ 

export interface NotificationObj {
  productId: string,
  user_endpoint?: string
}

export interface UpdatableNotificationObj extends NotificationObj{
  productId: string,
  user_endpoint: string
}

export async function addNotificationsToDynamo({productId, user_endpoint} : UpdatableNotificationObj) {
  // check if product already has been reported
  let notifyObj2 : NotificationObj = {productId: productId};
  let notificationResponse = await getProductNotifications(notifyObj2);

  console.log("getResponse ->  " + JSON.stringify(notificationResponse));

  // if product isn't in notifications DB yet, POST new to  DynamoDB
  if (Object.keys(notificationResponse).length == 0){
    API.post('myAPI', '/notificationsLambda-dev', {
      body: {
        Item: {product_id: productId, user_endpoints: [user_endpoint]},
      },
      headers: { //
        'Content-Type': 'application/json',
        Authorization: `${(await Auth.currentSession())
          .getIdToken()
          .getJwtToken()}`,
      },
    })
      .then(res => {
        console.log('SUCCESS 200 Notification created');
        console.log(res);
      })
      .catch(err => {
        console.log(err);
        console.log(err.response.data);
      });
  }
  else{
    // else, product is already in reports DB, so PUT/append new report
    console.log("Appending new user_endpoint to product notifications DB.");
    console.log(JSON.stringify(notificationResponse['Item']['user_endpoints']));
    
    // add user_endpoint to product notifications to DynamoDB
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
        console.log('SUCCESS 200 Notifications updated');
        console.log(res);
      })
      .catch(err => {
        console.log(err);
        console.log(err.response.data);
      });
  }
}

export async function deleteNotificationsFromDynamo({productId, user_endpoint} : UpdatableNotificationObj) {
  // check if product already has been reported
  // let notifyObj2 : NotificationObj = {productId: productId};
  // let notificationResponse = await getProductNotifications(notifyObj2);

  // console.log("getResponse ->  " + JSON.stringify(notificationResponse));

  console.log("Removing new user_endpoint to product notifications DB.");
  // console.log(JSON.stringify(notificationResponse['Item']['user_endpoints']));
  
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
      console.log('SUCCESS 200 Notifications removed');
      console.log(res);
    })
    .catch(err => {
      console.log(err);
      console.log(err.response.data);
    });
}

export async function getProductNotifications({productId} : Report) {
  console.log('get notification endpoints from dynamoDB...');
  return (
    API.get('myAPI', '/notificationsLambda-dev', {
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
      console.log('SUCCESS 200');
      console.log(res);
      return res;
    })
    .catch(err => {
      console.log(err);
      console.log(err.response.data);
      
    })
  )
}

export async function registerDeviceToken(token: string) {
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
      // console.log("Registered device token!");
      console.log(res)
      return res;
    })
    .catch(err => {
      console.log(err);
    })
  )
}


/************** OCR IMAGE PROCESSING ***************/
export async function ocrPreprocessing(base64Image: string) {
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
      console.log("SUCCESSFUL RESPONSE: ")
      return res.body;
    })
    .catch(err => {
      console.log(err);
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

// for faceted product search pagination
const calculateTotalPages = (totalProducts: number, pageSize: number) => {
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
  let productDisplayName = "";
  productDisplayName += productName ? productName : "";

  if (brandsList?.length > 0){
    if (productDisplayName !== ""){
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

export async function translateIngredients(ingredients: string){
  if (ingredients?.length > 0){
    let translatedIngredients = await translate(ingredients, {to: 'en', forceTo: true, autoCorrect: true});
    // console.log("\n\ntranslatedIngredients:"+JSON.stringify(translatedIngredients)+"\n\n");
    return translatedIngredients.text;
  }
}

function mergeAllergenStringsToList(s1: string, s2: string){
  // let merged_list;
  // if (s1+s2===""){
  //   merged_list=[]
  // }else{
  let s1_list= s1 !== "" ? s1.split(",") : [];
  let s2_list= s2 !== "" ? s2.split(",") : [];
  let merged_list = s1_list.concat(s2_list)
  // }
  return merged_list;
}

export async function extractEnglishAllergens(allergenList: Array<string>) {
  if (allergenList) {
    // console.log("allergenList = " + allergenList);
    let translatedAllergens = new Array();
    let i = 0;
    while (i < allergenList.length) {
      let allergen = allergenList[i];
      if (allergen.length > 0){
        // console.log(allergen);
        allergen = allergen.toLowerCase();
        if (allergen.includes("en:")) {
          // console.log(allergen + " includes en:");
          // if (translatedAllergens.length > 0) {
          //   translatedAllergensallergen.slice(3).charAt(0).toUpperCase() + allergen.slice(4);
          // } else {
          let englishAllergen = allergen.slice(3).charAt(0).toUpperCase() + allergen.slice(4);
          if (!translatedAllergens.includes(englishAllergen)){
            translatedAllergens.push(englishAllergen);
          }
        } else {
          // allergen is listed not in english, so translate
          // console.log("allergen to be translated: " + allergen.slice(3) + " from '" + allergen.slice(0, 2) + "'");
          let translation;
          if (allergen.charAt(2) === ':'){
            translation = await translate(allergen.slice(3), {from: allergen.slice(0, 2), to: 'en', forceTo: true, autoCorrect: true});
          } else {
            translation = await translate(allergen, {to: 'en', forceTo: true, autoCorrect: true});
          }
          if (translation.from.text.didYouMean){
            translation = await translate(translation.from.text.value.replace(/[[\]]/g,''), {to: 'en', forceTo: true, autoCorrect: true})
          }
          // console.log("\n\ntranslated "+allergen+" -> "+  JSON.stringify(translation));
          // console.log("before: " + s);
          // if (s.length > 0) {
            // s+= ", " + translation.text.charAt(0).toUpperCase() + translation.text.slice(1);
          // } else {
          let translated_allergen = translation.text.charAt(0).toUpperCase() + translation.text.slice(1);
          if (!translatedAllergens.includes(translated_allergen)){
            translatedAllergens.push(translated_allergen);
          }
          // console.log("after: " + s);
        }
      }
      i++;
    }
    // console.log("allergens_string = " + s);
    return translatedAllergens.join(", ");
  }
}

function compileBarcodeResult(data : object, barcodeText : string | null = null) {
  
  if (data?.status_verbose !== "found"){
    return {
      "status": data?.status_verbose, 
      "product_code": barcodeText == null ? data?.product?.code : barcodeText,
    }
  } else {
    return {
      "product_display_name": getProductDisplayName(data?.product?.product_name, data?.product?.brands_tags, data.product?.quantity),
      "date": new Date().toISOString(),
      "status": data?.status_verbose,
      "product_code": barcodeText == null ? data?.product?.code : barcodeText,
      "product_name": data?.product?.product_name,
      "product_image": data?.product?.image_front_url,
      "ingredients_image": data?.product?.image_ingredients_thumb_url,
      // "image_size": data?.product?.
      "ingredients_text": data?.product?.ingredients_text,
      "ingredients_complete_boolean": data?.product?.states_hierarchy.includes("en:ingredients-completed"),
      // "states_hierarchy": data?.product?.states_hierarchy,
      "allergens": mergeAllergenStringsToList(data?.product?.allergens, data?.product?.allergens_from_ingredients),
      // "allergens_from_ingredients": data?.product?.allergens_from_ingredients,
      "may_contain": data?.product?.traces ? data?.product?.traces.replace("en:", "").replace(" ", "") : "",
      "traces_tags": data?.product.traces_tags,//[0].replace("en:en-", "").split("-en-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(", ") : "",
      "missing_ingredients": data?.product?.unknown_ingredients_n,    
      "non_vegan_ingredients": data?.product?.ingredients_analysis?.["en:non-vegan"],
      "vegan_status_unknown_ingredients": data?.product?.ingredients_analysis?.["en:vegan-status-unknown"],
      "vegetarian_status_unkown_ingredients": data?.product?.ingredients_analysis?.["en:vegetarian-status-unknown"],
    }
  } 
}

export async function scanBarcode(barcodeText: string) {
  console.log("fetching from OFF");
  return fetch(`https://world.openfoodfacts.org/api/v2/product/${barcodeText}.json`, {
    method: "GET",
    headers: {
      'Content-Type': 'application/json'
    }
  }).then(res => {
    console.log("Response received.");
    return res.json().then(async (data) => {
      // console.log(data);
      return compileBarcodeResult(data, barcodeText); 
    })
    }).catch(err => {
      console.log(err);
      console.log(err.response.data);
    });
}

export async function facetedProductSearch({queryString = null, page = 1, searchTerms = "", allergensContains, allergensNotContains}: SearchQuery) {
  let OFFSearchQueryUrl : string;
  let parameters = ""
  let tagCount = 0;  

  if (queryString == null) {
    if (searchTerms !== "") {
      parameters += `&search_terms2=${searchTerms}`;
    }

    // if (brand !== "") {
    //   parameters += `&tagtype_${tagCount}=brands&tag_contains_${tagCount}=contains&tag_${tagCount}=${brand}`;
    //   tagCount++;
    // }

    // if (category !== "") {
    //   parameters += `&tagtype_${tagCount}=categories&tag_contains_${tagCount}=contains&tag_${tagCount}=${category}`;
    //   tagCount++;
    // } 
    // https://world.openfoodfacts.org/cgi/search.pl?action=process&tagtype_0=allergens&tag_contains_0=contains&tag_0=milk&sort_by=unique_scans_n&page_size=20
    // https://world.openfoodfacts.org/cgi/search.pl?action=process&tagtype_0=allergens&tag_does_not_contain_0=does_not_contain&tag_0=Milk&page_size=25&json=true

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

  console.log(`${OFFSearchQueryUrl}&page=${page}`)
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
    }).catch(err => {//
      console.log(err); //
      console.log(err.response.data);
    });  
}
//
export function getInitialNotificationState(productId: string, scans: object) { // i'll try using ide
  if (scans != null && Object.keys(scans).includes(productId)){
      return scans[productId].receive_notifications;
  }
  else {
      return false;
  }
}