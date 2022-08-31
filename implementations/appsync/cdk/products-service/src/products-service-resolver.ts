import { AppSyncResolverEvent } from 'aws-lambda';

const deprecatedProducts = [{
  sku: "apollo-federation-v1",
  package: "@apollo/federation-v1",
  reason: "Migrate to Federation V2",
}];

const user = {
  email: "support@apollographql.com",
  name: "Jane Smith",
  totalProductsCreated: 1337,
  averageProductsCreatedPerYear: Math.round(1337/10)
 };

 const productsResearch = [
  {
    study: {
      caseNumber: "1234",
      description: "Federation Study"
    }
  },
  {
    study: {
      caseNumber: "1235",
      description: "Studio Study"
    }
  }
]


const products = [
  {
    id: 'apollo-federation',
    sku: 'federation',
    package: '@apollo/federation',
    variation: 'OSS',
    createdBy: user,
    research: [productsResearch[0]],
    dimensions: {
      size: 'small',
      weight: 1,
      unit: 'kg',
    }
  },
  {
    id: 'apollo-studio',
    sku: 'studio',
    package: '',
    createdBy: user,
    research: [productsResearch[1]],
    variation: 'platform',
    dimensions: {
      size: 'medium',
      weight: 2,
      unit: 'l',
    }
  },
];

// Handler resolving the entities from representations argument
export const handler = async (event: AppSyncResolverEvent<any>) => {
  console.log(`event ${JSON.stringify(event)}`);

  let result: any = [];
  switch (event.info.parentTypeName) {
    case 'Product':
      console.log(`dealing with product and field ${event.info.fieldName}`);
      switch (event.info.fieldName) {
        case 'createdBy':
          result = {...user, '_entities': {}};
          break;
      }
      break;
    case 'Query':
      switch (event.info.fieldName) {
        case 'deprecatedProduct':
          result = deprecatedProducts[0];
        case 'product':
          if (event.arguments.id) result = products.find((p) => p.id === event.arguments.id);
          if (event.arguments.sku && event.arguments.package)
            result = products.find((p) => p.sku === event.arguments.sku && p.package === event.arguments.package);
          if (event.arguments.sku && event.arguments.variation && event.arguments.variation.id)
            result = products.find(
              (p) => p.sku === event.arguments.sku && p.variation === event.arguments.variation.id
            );
            result['_entities'] = {};
          break;
        case '_service':
          result = { sdl: process.env.SCHEMA };
          break;
        case '__typename':
          // Not sufficient : need capability to set extensions ...
          result = { ftv1: 'test' };
          break;
        case '_entities':
          const { representations } = event.arguments;
          let filteredEntites: any[] = [];

          for (const representation of representations as [any]) {
            switch (representation['__typename']) {
              case 'User':
                filteredEntites = [{...user, __typename: representation['__typename']}];
                break;
              case 'ProductResearch':
                const filteredProductResearch = productsResearch.find((p: any) => {
                  for (const key of Object.keys(representation)) {
                    console.log(`key ${key} ${typeof representation[key]} ${p[key]} ${representation[key]}`);
                    if (typeof representation[key] != 'object' && key != '__typename' && p[key] != representation[key]) {
                      console.log(`key not matching`);
                      return false;
                    } else if (typeof representation[key] == 'object') {
                      for (const subkey of Object.keys(representation[key])) {
                        console.log(`subKey ${subkey} ${typeof representation[key][subkey]} ${p[key][subkey]} ${representation[key][subkey]}`);
                        if (
                          typeof representation[key][subkey] == 'object' ||
                          p[key][subkey] != representation[key][subkey]
                        ) {
                          console.log(`subkey not matching`);
                          return false;
                        }
                      }
                    }
                  }
                  return true;
                });
                if(filteredProductResearch){
                  filteredEntites.push({...filteredProductResearch, __typename: representation['__typename']});
                }
                break;
              case 'DeprecatedProduct':
                const filteredProduct = deprecatedProducts.find((p: any) => {
                  for (const key of Object.keys(representation)) {
                    console.log(`key ${key} ${typeof representation[key]} ${p[key]} ${representation[key]}`);
                    if (typeof representation[key] != 'object' && key != '__typename' && p[key] != representation[key]) {
                      console.log(`key not matching`);
                      return false;
                    } else if (typeof representation[key] == 'object') {
                      for (const subkey of Object.keys(representation[key])) {
                        console.log(`subKey ${subkey} ${typeof representation[key][subkey]} ${p[key][subkey]} ${representation[key][subkey]}`);
                        if (
                          typeof representation[key][subkey] == 'object' ||
                          p[key] != representation[key][subkey]
                        ) {
                          console.log(`subkey not matching`);
                          return false;
                        }
                      }
                    }
                  }
                  return true;
                });
                if(filteredProduct){
                  filteredEntites.push({...filteredProduct, __typename: representation['__typename']});
                }
                break;
              case 'Product':
                filteredEntites.push({...products.find((p: any) => {
                  for (const key of Object.keys(representation)) {
                    console.log(`key ${key} ${typeof representation[key]} ${p[key]} ${representation[key]}`);
                    if (typeof representation[key] != 'object' && key != '__typename' && p[key] != representation[key]) {
                      console.log(`key not matching`);
                      return false;
                    } else if (typeof representation[key] == 'object') {
                      for (const subkey of Object.keys(representation[key])) {
                        console.log(`subKey ${subkey} ${typeof representation[key][subkey]} ${p[key][subkey]} ${representation[key][subkey]}`);
                        if (
                          typeof representation[key][subkey] == 'object' ||
                          p[key] != representation[key][subkey]
                        ) {
                          console.log(`subkey not matching`);
                          return false;
                        }
                      }
                    }
                  }
                  console.log(`found ${JSON.stringify(p)}`)
                  return true;
                }), __typename: representation['__typename']});
                break;
              default:
                break;
            }
            

          }
          result = filteredEntites;
          break;
      }
      break;
  }
  console.log(`returning ${JSON.stringify(result)}`);
  return result;
};
