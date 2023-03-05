import {API, Auth} from 'aws-amplify';

/************** USERS ***************/ 

export interface User {
  username: string,
  email: string,
  allergens?: Array<string>,
  scans?: Array<object>
}

interface UpdatableUserData extends User {
  allergens?: Array<string>,
  scan?: object
}

export async function postNewUser({username, email, allergens} : User) {
  console.log({username: username, email: email, allergens: allergens, hasCompletedSetup: true, scans: {}});
  API.post('myAPI', '/users', {
    body: {
      Item: {username: username, email: email, allergens: allergens, hasCompletedSetup: true, scans: {}},
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
      console.log(res); //
    })
    .catch(err => {
      console.log(err);
      console.log(err.response.data);
    });
}


export async function updateUser({username, email, allergens, scan}: UpdatableUserData){// , {allergens = [], scans = []} : UpdatableUserData) {
  let requestBody;
  if (allergens) {
    // if (typeof allergens[0] == String)
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
  } else if (scan) {
    console.log("data is scan");
  // user.scans = {'1': {}, '2'={}}
  // if product_id in user.scans: update that scan
  // else append to user.scans 
    requestBody = {
      Key: {username: username, email: email},
      UpdateExpression: `set #scans.#product = :scanResult`, // ${scan.product_id}
      ExpressionAttributeValues: {
        ':scanResult': [scan],
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
      console.log(res);
    })
    .catch(err => {
      console.log(err);
      console.log(err.response.data);
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

export async function scanBarcode(barcodeText: string) {
  return fetch(`https://world.openfoodfacts.org/api/v2/product/${barcodeText}.json`, {
    method: "GET",
    headers: {
      'Content-Type': 'application/json'
    }
  }).then(res => {
    console.log("Response received.");
    return res.json().then((data) => {
      console.log(data);
      const getProductDisplayName = () => {
        let productDisplayName = data?.product?.product_name ? data?.product?.product_name : "";
        productDisplayName += data?.product?.brands ? " - " + data?.product?.brands : "";
        productDisplayName += data?.product?.quantity ? " - " + data?.product?.quantity : "";
        //remove unnecessary punctuation from product name
        productDisplayName = productDisplayName.replace(/[.,\/#!$%\^&\*;:{}=\_`~()]/g,"")
            .replace(/\s{2,}/g," ");
        return productDisplayName;
      }
      const scanResults = {
        "product_display_name": getProductDisplayName(),
        "date": new Date().toISOString(),
        "status": data?.status_verbose,
        "product_code:": data?.code,
        "product_name": data?.product?.product_name,
        "allergens": data?.product?.allergens_hierarchy,
        "allergens_from_ingredients": data?.product?.allergens_from_ingredients,
        "may_contain": data?.product?.traces,
        "missing_ingredients": data?.product?.unknown_ingredients_n,
        "non_vegan_ingredients": data?.product?.ingredients_analysis?.["en:non-vegan"],
        "vegan_status_unknown_ingredients": data?.product?.ingredients_analysis?.["en:vegan-status-unknown"],
        "vegetarian_status_unkown_ingredients": data?.product?.ingredients_analysis?.["en:vegetarian-status-unknown"],
        "receive_notifications": false
      }
      
      return scanResults
    })
    }).catch(err => {
      console.log(err);
      console.log(err.response.data);
    });
}