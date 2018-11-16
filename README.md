# Node.js Optimizely RPC Decision Service

RPC decision service that is implemented using json over http. The API replicates the functionality of the SDK in a centralized location. It also implementes user profiles and datafile management. With that in mind, the application exposes two endpoints. The "rpc" endpoint accepts the different methods as JSON that replicate the SDK methods and the "describe" endpoint which returns the descriptions of the different methods and data types. This is not a Rest based API but a "json over http" API. You will only need to communicate with a single endpoint.

This current version does not support multiple projects. The project settings currently live in the configuration file. I am currently working on the next release that will support changing the project datafile through the RPC method call. It will support multiple Optimizely clients each capable of handling a different SDK project datafile.

## Getting Started

The following instructions will get the project up and running on your local machine.

### Prerequisites

* Download or clone a copy of the project.
* Install the required packages via "npm" from the package.json. 
* Install [Redis](https://redis.io/download) locally. 
	* By default the decision service is configured to connect to '127.0.0.1:6379'.
	* This setting can be configured in the 'config.js' file located in the 'config directory'.
* Datafile settings, like CDN url and SDK key, are also configured in the 'config.js' file located in the 'config directory'.

### Running the server

1. Start the local Redis server.
2. Run 'server.js' in the root directory.

## Using the decision service

All methods are routed through two endpoints.
* POST - http:// {your_server} /rpc
	* Example: http://localhost:9090/rpc 
	
* GET - http:// {your_server} /describe
	* Example: http://localhost:9090/describe

**Note:** You can find an exported Postman collections file, "DS RPC.postman_collection.json", in the "postman" directory in this project that contains 5 requests that you can use for testing. These requests will work with the default server configuration that uses an already configured full stack test that is currently running in Optimizely.

----

### Activating an experiment
**POST** -  http:// {your_server} /rpc

**JSON Body**

Required:
* experiment_key
* user_id

Optional:
* attributes

```json
{
    "experiment": {
        "experiment_key":"ds_test",
        "user_id":"123456789",
        "attributes": {"test_user":"true"}
    }
}
```

#### Response

 * **"variation_key"** is appended and returns the assigned variation.

```json
{
    "experiment": {
        "experiment_key":"ds_test",
        "user_id":"123456789",
        "attributes": {"test_user":"true"},
        "variation_key":"assigned_variation"
    }
}
```
----
### Activating a feature test or feature flags

Feature tests and feature flags or rollouts are called by using the same method and replicates the SDK functionality. If a feature test and a feature rollout are running on a feature, the test is evaluated first.

**POST** -  http:// {your_server} /rpc

**JSON Body [ Feature Test ]**

Required:
* feature_key
* user_id

Optional:
* attributes
* feature_config
* **feature_test_key** must be included if you want the **"variation_key"** to be included in the response for a feature test.

```json
{
    "features": {
        "feature_key":"feature_2",
        "user_id":"123456789",
        "attributes": {"test_user":"true"},
         "feature_config": {"string_2": "string", "boolean_2": "boolean"}
    }
}
```

#### Response

 * **"variation_key"** is appended to the response if the feature is in a test.
 * **"is_enabled"** true or false value is appended to the response.
 * **"feature_config"** has been modified and returns the values assigned to the feature varibles if they exist.

```json
{
    "features": {
        "feature_key": "feature_2",
        "user_id": "123456789",
        "attributes": {
            "test_user": "true"
        },
        "feature_test_key": "feature_2_test",
        "variation_key": "variation_2",
        "is_enabled": true,
        "feature_config": {
            "string_2": "Text for string variation 2",
            "boolean_2": true
        }
    }
}
```


#### Working with feature variables
Retrieving the feature variable values is accomplished by including the variable names and their corresponding data type in the **"feature_config"** property. You may request all of the variables at once or limit the request to an individual variable or a limited group of variables. 

The accepted data types are:
* string
* boolean
* integer
* double

A variable named **"screen_width"** that has an integer data type would be requested in the following way:

```json
{
        "feature_config": {
            "screen_width": "integer"
        }
}
```

The value for the variable would be returned by replacing the **"integer"** data type value with the actual variable value. Values are returned in their native JSON supported data type. If you have requested more than one variable they will all be returned in the same "feature_config" property.

```json
{
        "feature_config": {
            "screen_width": 1280
        }
}
```
----


### Tracking conversion events
**POST** -  http:// {your_server} /rpc

**JSON Body**

Required:
* experiment_key
* user_id

Optional:
* attributes
* tags

```json
{
    "track": {
        "event_key": "test_tracking",
        "user_id": "123456789",
        "attributes": {
            "test_user": "true"
        },
        "tags": {"revenue": 10000}
    }
}
```

#### Response

 * **"acknowledgement"** is appended and returns "success" or a description of the error.

```json
{
    "track": {
        "event_key": "test_tracking",
        "user_id": "123456789",
        "attributes": {
            "test_user": "true"
        },
        "tags": {"revenue": 100000},
        "acknowledgement": "success"
    }
}
```
----


### Describe RPC methods
**GET** -  http:// {your_server} /describe

The describe endpoint, scans through the descriptions of both the methods and the data types, and returns that information to the caller in the response. This makes it easy for the consumers of the api to always know how to use it, even as it is actively being developed.

#### Sample Response

 
```json
{
    "types": {
        "experiment": {
            "description": "the details of the experiment",
            "props": {
                "experiment_key": [
                    "string",
                    "required"
                ],
                "user_id": [
                    "string",
                    "required"
                ],
                "attributes": [
                    "object",
                    "optional"
                ],
                "variation_key": [
                    "string",
                    "returns the variation key assigned"
                ],
                "project_id": [
                    "string",
                    "optional [currently not implemented]"
                ],
                "datafile_url": [
                    "string",
                    "optional [currently not implemented]"
                ],
                "datafile_key": [
                    "string",
                    "optional [currently not implemented]"
                ]
            }
        },
        "features": {
            "description": "the details of a feature test",
            "props": {
                "feature_key": [
                    "string",
                    "required"
                ],
                "user_id": [
                    "string",
                    "required"
                ],
                "attributes": [
                    "object",
                    "optional"
                ],
                "feature_test_key": [
                    "string",
                    "optional - returns feature test key if feature is in a test"
                ],
                "variation_key": [
                    "string",
                    "returns variation key for the feature test"
                ],
                "is_enabled": [
                    "boolean",
                    "returns \"true\" if feature is enabled"
                ],
                "feature_config": [
                    "object",
                    "returns feature variable values"
                ]
            }
        },
        "track": {
            "description": "the details of the track conversion event",
            "props": {
                "event_key": [
                    "string",
                    "required"
                ],
                "user_id": [
                    "string",
                    "required"
                ],
                "attributes": [
                    "object",
                    "optional"
                ],
                "tags": [
                    "array of objects",
                    "optional"
                ],
                "acknowledgement": [
                    "string",
                    "returns \"success\" or error message"
                ]
            }
        },
        "task": {
            "description": "a task entered by the client to do at a later time",
            "props": {
                "user_id": [
                    "number",
                    "required"
                ],
                "content": [
                    "string",
                    "require"
                ],
                "expire": [
                    "date",
                    "required"
                ]
            }
        }
    },
    "methods": {
        "experiment": {
            "description": "activates the experiment, and returns the assigned variation",
            "params": [
                "experiment: the experiment object"
            ],
            "returns": [
                "experiment object with variation key assigned"
            ]
        },
        "track": {
            "description": "track a conversion event",
            "params": [
                "track: the track event object"
            ],
            "returns": [
                "track event object with acknowledgement"
            ]
        },
        "features": {
            "description": "activates a feature flag or feature test and returns the variable values if any",
            "params": [
                "features: the features object"
            ],
            "returns": [
                "features object with the variable values if requested"
            ]
        },
        "task": {
            "description": "[Not functional] creates a new task, and returns the details of the new task",
            "params": [
                "task: the task object"
            ],
            "returns": [
                "task"
            ]
        }
    }
}
```

