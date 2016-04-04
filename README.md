FORMAT: 1A

[![Build Status](https://travis-ci.org/aliok/sample-user-service-on-rhmap.svg?branch=master)](https://travis-ci.org/aliok/sample-user-service-on-rhmap)

# IMPORTANT
### This application is deployed on RHMAP and publicly available at <https://sampleuserserviceodevegtis-aliok.rhcloud.com>
### Dear code reviewer: see [REVIEW.md](./REVIEW.md)
Rest of this file is API blueprint.


TODO:
* Shrinkwrap
* JSHint remove unnecessary rules
* Clustering
* Travis

# About this API blueprint on RHMAP

### I think RHMAP studio doesn't support the parameter feature of API blueprints thus "Try this API live" doesn't work.

# User service

Provides user services such as search, filtering and persistence.


# Users [/api/users]

Users endpoint.

## Create a new user [POST]

Create a new user.

+ Request (application/json)
        {
            "gender": "female",
            "name": {
              "title": "miss",
              "first": "foo",
              "last": "bar"
            },
            "location": {
              "street": "foobar",
              "city": "foobar",
              "state": "foobar",
              "zip": 12345
            },
            "email": "foobar@example.com",
            "username": "foobar",
            "password": "foobar",
            "salt": "foobar",
            "md5": "foobar",
            "sha1": "foobar",
            "sha256": "foobar",
            "registered": 12345,
            "dob": 123456789,
            "phone": "000-111-2222",
            "cell": "000-111-2222",
            "PPS": "1234567T",
            "picture": {
              "large": "https://randomuser.me/api/portraits/women/99.jpg",
              "medium": "https://randomuser.me/api/portraits/med/women/99.jpg",
              "thumbnail": "https://randomuser.me/api/portraits/thumb/women/99.jpg"
            }
        }

+ Response 200 (application/json)
    + Body
        {
            "OK": 1
        }




# User [/api/users/{username}]

User endpoint.

## Retrieve a user by username [GET]

Retrieve a user by username.

+ Parameters
    + username: tinywolf709 (required, string) - Username

+ Response 200 (application/json)
    + Body
        {
            "gender": "female",
            "name": {
              "title": "miss",
              "first": "alison",
              "last": "reid"
            },
            "location": {
              "street": "1097 the avenue",
              "city": "Newbridge",
              "state": "ohio",
              "zip": 28782
            },
            "email": "alison.reid@example.com",
            "username": "tinywolf709",
            "password": "rockon",
            "salt": "lypI10wj",
            "md5": "bbdd6140e188e3bf68ae7ae67345df65",
            "sha1": "4572d25c99aa65bbf0368168f65d9770b7cacfe6",
            "sha256": "ec0705aec7393e2269d4593f248e649400d4879b2209f11bb2e012628115a4eb",
            "registered": 1237176893,
            "dob": 932871968,
            "phone": "031-541-9181",
            "cell": "081-647-4650",
            "PPS": "3302243T",
            "picture": {
              "large": "https://randomuser.me/api/portraits/women/60.jpg",
              "medium": "https://randomuser.me/api/portraits/med/women/60.jpg",
              "thumbnail": "https://randomuser.me/api/portraits/thumb/women/60.jpg"
            }
        }

## Delete a user [DELETE]

Delete a user.

+ Parameters
    + username: tinywolf709 (required, string) - Username

+ Response 200 (application/json)
    + Body
        {
            "OK": 1
        }

## Replace a user [PUT]

Replace a user.

+ Parameters
    + username: tinywolf709 (required, string) - Username

+ Request (application/json)

            {
                "gender": "female",
                "name": {
                  "title": "miss",
                  "first": "alison",
                  "last": "reid"
                },
                "location": {
                  "street": "1097 the avenue",
                  "city": "Newbridge",
                  "state": "ohio",
                  "zip": 28782
                },
                "email": "alison.reid@example.com",
                "username": "tinywolf709",
                "password": "rockon",
                "salt": "lypI10wj",
                "md5": "bbdd6140e188e3bf68ae7ae67345df65",
                "sha1": "4572d25c99aa65bbf0368168f65d9770b7cacfe6",
                "sha256": "ec0705aec7393e2269d4593f248e649400d4879b2209f11bb2e012628115a4eb",
                "registered": 1237176893,
                "dob": 932871968,
                "phone": "031-541-9181",
                "cell": "081-647-4650",
                "PPS": "3302243T",
                "picture": {
                  "large": "https://randomuser.me/api/portraits/women/60.jpg",
                  "medium": "https://randomuser.me/api/portraits/med/women/60.jpg",
                  "thumbnail": "https://randomuser.me/api/portraits/thumb/women/60.jpg"
                }
            }

+ Response 200 (application/json)
    + Body
        {
            "OK": 1
        }

## Patch a user [PATCH]

Patch a user.

+ Parameters
    + username: tinywolf709 (required, string) - Username

+ Request (application/json)

        {
            "gender": "male",
            "phone": undefined,
        }

+ Response 200 (application/json)
    + Body
        {
            "OK": 1
        }



# Search [/api/search/users]

Search users endpoint.

## Search users [POST]

Search users.

+ Request (application/json)

        {
            "gender": "female",
            "name.first": "alison",
            "location.state": "ohio"
        }

+ Response 200 (application/json)
    + Body

        {
            "gender": "female",
            "name": {
                "title": "miss",
                "first": "alison",
                "last": "reid"
            },
            "location": {
                "street": "1097 the avenue",
                "city": "Newbridge",
                "state": "ohio",
                "zip": 28782
            },
            "email": "alison.reid@example.com",
            "username": "tinywolf709",
            "password": "rockon",
            "salt": "lypI10wj",
            "md5": "bbdd6140e188e3bf68ae7ae67345df65",
            "sha1": "4572d25c99aa65bbf0368168f65d9770b7cacfe6",
            "sha256": "ec0705aec7393e2269d4593f248e649400d4879b2209f11bb2e012628115a4eb",
            "registered": 1237176893,
            "dob": 932871968,
            "phone": "031-541-9181",
            "cell": "081-647-4650",
            "PPS": "3302243T",
            "picture": {
                "large": "https://randomuser.me/api/portraits/women/60.jpg",
                "medium": "https://randomuser.me/api/portraits/med/women/60.jpg",
                "thumbnail": "https://randomuser.me/api/portraits/thumb/women/60.jpg"
            }
        }
