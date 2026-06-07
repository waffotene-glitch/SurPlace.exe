const swaggerJSDoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "SurPlace API",
      version: "1.0.0",
      description: "API documentation for SurPlace verified food reviews.",
    },
    servers: [
      {
        url: "http://localhost:5050",
        description: "Local API server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        AuthResponse: {
          type: "object",
          properties: {
            token: { type: "string" },
            user: { $ref: "#/components/schemas/User" },
          },
        },
        Dashboard: {
          type: "object",
          additionalProperties: true,
        },
        Error: {
          type: "object",
          properties: {
            message: { type: "string" },
          },
        },
        Plate: {
          type: "object",
          additionalProperties: true,
        },
        Restaurant: {
          type: "object",
          additionalProperties: true,
        },
        Review: {
          type: "object",
          additionalProperties: true,
        },
        User: {
          type: "object",
          properties: {
            id: { type: "string" },
            fullName: { type: "string" },
            email: { type: "string", format: "email" },
            role: { type: "string", enum: ["user", "manager"] },
          },
        },
      },
      responses: {
        BadRequest: {
          description: "Invalid request.",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
            },
          },
        },
        NotFound: {
          description: "Resource not found.",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
            },
          },
        },
        Unauthorized: {
          description: "Missing or invalid bearer token.",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
            },
          },
        },
      },
    },
    paths: {
      "/api/auth/register": {
        post: {
          tags: ["Auth"],
          summary: "Register a user or manager account",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["fullName", "email", "password"],
                  properties: {
                    fullName: { type: "string", example: "Marie-Claire" },
                    email: { type: "string", format: "email", example: "user@example.com" },
                    password: { type: "string", format: "password", example: "Password123" },
                    role: { type: "string", enum: ["user", "manager"], default: "user" },
                  },
                },
              },
            },
          },
          responses: {
            201: {
              description: "Registered account and JWT.",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/AuthResponse" },
                },
              },
            },
            400: { $ref: "#/components/responses/BadRequest" },
            409: {
              description: "Email already exists.",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Error" },
                },
              },
            },
          },
        },
      },
      "/api/auth/login": {
        post: {
          tags: ["Auth"],
          summary: "Log in with email and password",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["email", "password"],
                  properties: {
                    email: { type: "string", format: "email", example: "user@example.com" },
                    password: { type: "string", format: "password", example: "Password123" },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: "Logged-in account and JWT.",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/AuthResponse" },
                },
              },
            },
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/api/auth/me": {
        get: {
          tags: ["Auth"],
          summary: "Get the authenticated user",
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: "Current user.",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      user: { $ref: "#/components/schemas/User" },
                    },
                  },
                },
              },
            },
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/api/restaurants": {
        get: {
          tags: ["Restaurants"],
          summary: "List restaurants",
          parameters: [
            { in: "query", name: "q", schema: { type: "string" } },
            { in: "query", name: "lat", schema: { type: "number" } },
            { in: "query", name: "lng", schema: { type: "number" } },
          ],
          responses: {
            200: {
              description: "Restaurant list.",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    additionalProperties: true,
                  },
                },
              },
            },
          },
        },
      },
      "/api/restaurants/{restaurantId}": {
        get: {
          tags: ["Restaurants"],
          summary: "Get restaurant details",
          parameters: [
            {
              in: "path",
              name: "restaurantId",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            200: {
              description: "Restaurant details.",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Restaurant" },
                },
              },
            },
            404: { $ref: "#/components/responses/NotFound" },
          },
        },
      },
      "/api/plates/{plateId}": {
        get: {
          tags: ["Plates"],
          summary: "Get plate details",
          parameters: [
            {
              in: "path",
              name: "plateId",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            200: {
              description: "Plate details.",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Plate" },
                },
              },
            },
            404: { $ref: "#/components/responses/NotFound" },
          },
        },
      },
      "/api/reviews/feed": {
        get: {
          tags: ["Reviews"],
          summary: "List the review feed",
          description: "Accepts an optional bearer JWT to include viewer-specific feed metadata.",
          security: [{ bearerAuth: [] }, {}],
          responses: {
            200: {
              description: "Review feed.",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    additionalProperties: true,
                  },
                },
              },
            },
          },
        },
      },
      "/api/reviews": {
        post: {
          tags: ["Reviews"],
          summary: "Create a review",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  additionalProperties: true,
                  properties: {
                    restaurantId: { type: "string" },
                    plateId: { type: "string" },
                    rating: { type: "number", minimum: 1, maximum: 5 },
                    comment: { type: "string" },
                    media: { type: "array", items: { type: "object", additionalProperties: true } },
                  },
                },
              },
            },
          },
          responses: {
            201: {
              description: "Created review.",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Review" },
                },
              },
            },
            400: { $ref: "#/components/responses/BadRequest" },
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/api/reviews/{reviewId}/like": {
        post: {
          tags: ["Reviews"],
          summary: "Toggle or create a review like",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              in: "path",
              name: "reviewId",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            200: {
              description: "Like state.",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    additionalProperties: true,
                  },
                },
              },
            },
            401: { $ref: "#/components/responses/Unauthorized" },
            404: { $ref: "#/components/responses/NotFound" },
          },
        },
      },
      "/api/manager/dashboard": {
        get: {
          tags: ["Manager"],
          summary: "Get manager dashboard metrics",
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: "Manager dashboard.",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Dashboard" },
                },
              },
            },
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/api/manager/restaurant": {
        get: {
          tags: ["Manager"],
          summary: "Get the manager restaurant",
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: "Managed restaurant.",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Restaurant" },
                },
              },
            },
            401: { $ref: "#/components/responses/Unauthorized" },
            404: { $ref: "#/components/responses/NotFound" },
          },
        },
        put: {
          tags: ["Manager"],
          summary: "Create or update the manager restaurant",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  additionalProperties: true,
                },
              },
            },
          },
          responses: {
            200: {
              description: "Updated restaurant.",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Restaurant" },
                },
              },
            },
            201: {
              description: "Created restaurant.",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Restaurant" },
                },
              },
            },
            400: { $ref: "#/components/responses/BadRequest" },
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/api/manager/plates": {
        post: {
          tags: ["Manager"],
          summary: "Create a managed plate",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  additionalProperties: true,
                },
              },
            },
          },
          responses: {
            201: {
              description: "Created plate.",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Plate" },
                },
              },
            },
            400: { $ref: "#/components/responses/BadRequest" },
            401: { $ref: "#/components/responses/Unauthorized" },
          },
        },
      },
      "/api/manager/plates/{plateId}": {
        put: {
          tags: ["Manager"],
          summary: "Update a managed plate",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              in: "path",
              name: "plateId",
              required: true,
              schema: { type: "string" },
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  additionalProperties: true,
                },
              },
            },
          },
          responses: {
            200: {
              description: "Updated plate.",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Plate" },
                },
              },
            },
            400: { $ref: "#/components/responses/BadRequest" },
            401: { $ref: "#/components/responses/Unauthorized" },
            404: { $ref: "#/components/responses/NotFound" },
          },
        },
        delete: {
          tags: ["Manager"],
          summary: "Delete a managed plate",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              in: "path",
              name: "plateId",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            200: {
              description: "Deleted plate result.",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    additionalProperties: true,
                  },
                },
              },
            },
            401: { $ref: "#/components/responses/Unauthorized" },
            404: { $ref: "#/components/responses/NotFound" },
          },
        },
      },
    },
  },
  apis: [],
};

module.exports = swaggerJSDoc(options);
