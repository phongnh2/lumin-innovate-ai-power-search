# Lumin Web Backend

Backend for Lumin Web Application

[![Branch Coverage](https://bitbucket.org/nitrolabs/lumin-web-backend-2.0/downloads/badge-branches.svg)]()
[![Function Coverage](https://bitbucket.org/nitrolabs/lumin-web-backend-2.0/downloads/badge-functions.svg)]()
[![Line Coverage](https://bitbucket.org/nitrolabs/lumin-web-backend-2.0/downloads/badge-lines.svg)]()
[![Statement Coverage](https://bitbucket.org/nitrolabs/lumin-web-backend-2.0/downloads/badge-statements.svg)]()

## Production endpoints

```
https://v2.luminpdf.com/api/web/ # Production
https://staging.luminpdf.com/api/web/ # Staging
https://dev.luminpdf.com/api/web/ # Develop
```

## Installation

The **Lumin Web Backend** is built with `typescript` and `nestjs`

```sh
    # Clone the project from Github
    git clone https://bitbucket.org/nitrolabs/lumin-web-backend-2.0

    # Move into the app directory
    cd lumin-web-backend-2.0

    # Install node modules
    npm install
```

Run mongo and redis. Then start the app using the following commands:

```sh
    # Run the development server
    npm run dev
```

## Naming Convention

Naming Convention for GraphQl file

**Mutation**

- **Naming:** Name your mutations verb first. Then the object, or “noun,” if applicable. Use camelCase.
- **Specificity:** Make mutations as specific as possible. Mutations should represent semantic actions that might be taken by the user whenever possible.
- **Input object:** Use a single, required, unique, input object type as an argument for easier mutation execution on the client.
- **Unique payload type:** Use a unique payload type for each mutation and add the mutation’s output as a field to that payload type.
- **Nesting:** Use nesting to your advantage wherever it makes sense.

You should make your `Input` and `Payload` name depend on the mutation's name.
Example:

```graphql
type mutation {
    createTeam(input: CreateTeamInput!): CreateTeamPayload
}
```

**Query**

- Query doesn't need to start with a verb
- But it still need to have `Input` and `Payload` name like mutation

Example

```graphql
type query {
    user(input: UserInput!): UserPayload
}
type UserInput {
    token: String!
}
type UserPayload {
    user: User!
}
```

**Validation**

- If we want to create new validation, we need to create new constraint implement ```InterfaceConstraint``` in Common/directives/GraphqlDirective/Constraints

```ts
export class EmailConstraint implements InterfaceConstraint {
  constructor(private readonly options?: ValidatorJS.IsEmailOptions) {}

  getName(): string {
    return 'EmailConstraint';
  }

  getErrorMessage(value: string): string {
    return `${value} must be an email`;
  }

  validate(value: string): boolean {
    return value && typeof value === 'string' && ValidatorJS.isEmail(value, this.options);
  }
}
```

- We need to validation both graphql and rest api


**Graphql**

- If we want to create new validation for graphql, we need to create new ```Validation Directive``` in Common/directives/GraphqlDirective/Directives

```ts
export class IsEmailDirective extends SchemaDirectiveVisitor {
  visitInputFieldDefinition(argument: GraphQLArgument) : void {
    argument.type = ValidationType.create(argument.type, new EmailConstraint(this.args.options));
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  visitArgumentDefinition(_argument: GraphQLArgument, { field }) {
    const { resolve = defaultFieldResolver } = field;
    field.resolve = (...args) => {
      const emailConstraint = new EmailConstraint(this.args.options);
      const { key } = this.args;
      const value = args[1][key] || '';
      if (!emailConstraint.validate(value)) {
        // eslint-disable-next-line no-console
        console.log(emailConstraint.getErrorMessage(value));
        throw new Error('[Validation Error]');
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      return resolve.apply(this, args);
    };
  }
}
```

- After that we add this directive into ```graphql.module.ts``` and give it a name

```ts
schemaDirectives: {
    ...
    IsEmail: IsEmailDirective, /* New validation */
},
```

- Next, we define this directive in ```validation.directive.graphql```

```graphql
...
directive @IsEmail(key: String = "") on ARGUMENT_DEFINITION | INPUT_FIELD_DEFINITION
```

- Using this syntax ```@IsEmail``` or ```@IsEmai(value)``` for validation graphql input

```graphql
input ForgotPasswordInput {
  email: String! @IsEmail
}

signIn(email: String! @IsEmail(key: "email"))
```

**Rest API**

- We using validation decorator from ```class-validator``` package
- If we want create custom validation for rest, we add new decorator in ```rest.validator.ts```

```ts
const MongoId = (validationOptions?: ValidationOptions) => (object: unknown, propertyName: string): void => {
  const MongoIdConstraint = new Constraints.MongoIdConstraint();
  registerDecorator({
    name: MongoIdConstraint.getName(),
    target: object.constructor,
    propertyName,
    constraints: [],
    options: {
      message: MongoIdConstraint.getErrorMessage(propertyName),
      ...validationOptions,
    },
    validator: {
      validate(value: string): boolean {
        return MongoIdConstraint.validate(value);
      },
    },
  });
};
```
- With each controller we need create DTO for Query and Body input and using decorator validation from ```class-validator``` or custom decorator from ```rest.validator.ts```

```ts
export class UploadFileDto {
    @IsOptional()
    @MongoId()
    documentId?: string;

    @MongoId()
    clientId: string;
}

uploadFile(@UploadedFiles() fileUploads, @Body() uploadFileDto: UploadFileDto, @Request() request) {
    const { clientId, documentId } = uploadFileDto;
    ...
}
```

## Migrate users from Lumin v1

Export users collection from production database

```cli
mongoexport --uri "mongodb://lumin:YSt6huk5EcezDRGG@mongo0.luminpdf.com:27018,mongo1.luminpdf.com:27018,mongo2.luminpdf.com:27018/Lumin?replicaSet=Lumin" --collection users --out luminv1.json --verbose [--pretty] [--limit <number>] --jsonArray
```

## Elasticsearch installation and setup

**Install**

1. Download from link: https://www.elastic.co/downloads/past-releases/elasticsearch-5-6-14

- Need to use 5.x version in order to consist with elastic2-doc-manager

2. Install Python 3 (if needed): `brew install python3`
3. Install Elasticsearch library for python: `pip3 install elasticsearch`
4. Install mongo-connector: `pip3 install mongo-connector`
5. Install elastic2-doc-manager to use with mongo-connector: `pip3 install elastic2-doc-manager`

**Run**

- Important to run mongo as replicateSet: `sudo mongod -relpSet rs0`
- Go into mongo shell and init replicate set: `rs.initiate()`

For indexing setting, check below example steps:

1. Create index analyzer by make a PUT request to http://localhost:9200/<database name in elastic>:

```
    Content-Type: "application/json"
    Body: {
        "settings": {
            "number_of_shards": 1,
            "analysis": {
                "filter": {
                    "autocomplete_filter": {
                        "type": "edge_ngram",
                        "min_gram": 3,
                        "max_gram": 20
                    }
                },
                "analyzer": {
                    "autocomplete": {
                        "type": "custom",
                        "tokenizer": "standard",
                        "filter": [
                            "lowercase",
                            "autocomplete_filter"
                        ]
                    }
                }
            }
        }
    }
```

2. Apply index analyzer to collection by make a PUT request to http://localhost:9200/<database name in elastic>/<collection name in elastic>:

```
    Content-Type: "application/json"
    Body: {
        "users": {
            "properties": {
                "email": {
                    "type": "text",
                    "analyzer": "autocomplete"
                },
                "name": {
                    "type": "text",
                    "analyzer": "autocomplete"
                }
            }
        }
    }
```

If you want to run using commandline, check bottom lines

- Sync doc from mongodb to elastic with specific collection: `mongo-connector -m 127.0.0.1:27017 -t 127.0.0.1:9200 -d elastic2_doc_manager -n lumin_dev.users -g lumin_otp.users`
- Check the reult: localhost:9200/\_cat/indices?v

Or simply run with our config file by npm: `npm run mongo-connector`

## Testing

**Unit Test**

Lumin use Jest Testing Framework to write Unit test. For more infomation: https://jestjs.io/

- Name your unit test with service name. Then suffix .test.ts. Ex: document.service.test.ts

- Run unit test

```sh
    npm run test
```

- Report file for code coverage: src/coverage/index.html

## Deployment

**Lumin Web Backend** is deployed to the Lumin Kubernetes cluster. Build, test and deployment is handled directely by CircleCI. The code is deployed:

- To `production` whenever a commit is made to the production branch

- To `staging` whenever a commit is made to the master branch

- To `dev` whenever a commit is made to the develop branch

## Docker Support

Docker is mainly supported for production purposes.

```sh
docker build -t nitrolabs/lumin-web-backend .
docker run --rm -p 4000:4000 nitrolabs/lumin-web-backend
```

## License

Copyright Nitrolabs 2018.
