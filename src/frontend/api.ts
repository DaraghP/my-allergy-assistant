import {API, Auth} from 'aws-amplify';

/************** USERS ***************/

export interface User {
  username: string,
  email: string,
  allergens?: Array<string>,
}

export async function postNewUser({username, email, allergens} : User) {
  API.post('myAPI', '/users', {
    body: {
      Item: {username: username, email: email, allergens: allergens, hasCompletedSetup: true},
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

export async function updateUser({username, email, allergens} : User) {
  API.put('myAPI', '/users', {
    body: {
      Key: {username: username, email: email},
      UpdateExpression: 'set allergens = :allergen_list',
      ExpressionAttributeValues: {
        ':allergen_list': allergens,
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
      return {
        "product_code:": data.code,
        "product_name": data.product.product_name,
        "allergens": data.product.allergens_hierarchy,
        "allergens_from_ingredients": data.product.allergens_from_ingredients,
        "may_contain": data.product.traces,
        "missing_ingredients": data.product.unknown_ingredients_n,
        "non_vegan_ingredients": data.product.ingredients_analysis["en:non-vegan"],
        "vegan_status_unknown_ingredients": data.product.ingredients_analysis["en:vegan-status-unknown"],
        "vegetarian_status_unkown_ingredients": data.product.ingredients_analysis["en:vegetarian-status-unknown"]
      }
    })
    }).catch(err => {
      console.log(err);
      console.log(err.response.data);
    });
}