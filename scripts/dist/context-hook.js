// scripts/lib/settings.js
import { readFileSync } from "node:fs";
import { basename, join } from "node:path";
import { homedir } from "node:os";
function readJsonFile(filePath) {
  try {
    const raw = readFileSync(filePath, "utf8");
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
function resolveConfig() {
  const authConfig = readJsonFile(join(homedir(), ".smritea", "auth.json"));
  const globalConfig = readJsonFile(join(homedir(), ".smritea", "config.json"));
  const projectConfig = readJsonFile(join(process.cwd(), ".smritea", "config.json"));
  const studioAccessToken = process.env.SMRITEA_STUDIO_ACCESS_TOKEN || (typeof authConfig?.access_token === "string" && authConfig.access_token.trim() !== "" ? authConfig.access_token : null);
  const selectedAppId = process.env.SMRITEA_APP_ID || (typeof globalConfig?.selected_app_id === "string" && globalConfig.selected_app_id.trim() !== "" ? globalConfig.selected_app_id : null);
  const selectedAppAPIKey = process.env.SMRITEA_API_KEY || (selectedAppId && authConfig?.apps && typeof authConfig.apps === "object" ? authConfig.apps[selectedAppId]?.api_key || null : null);
  const projectName = process.env.SMRITEA_PROJECT_NAME || (typeof projectConfig?.project === "string" && projectConfig.project.trim() !== "" ? projectConfig.project : basename(process.cwd()));
  const dataBaseUrl = process.env.SMRITEA_BASE_URL || (typeof globalConfig?.base_url === "string" && globalConfig.base_url.trim() !== "" ? globalConfig.base_url : "https://api-us.smritea.ai");
  const studioBaseUrl = process.env.SMRITEA_STUDIO_BASE_URL || (typeof globalConfig?.studio_base_url === "string" && globalConfig.studio_base_url.trim() !== "" ? globalConfig.studio_base_url : "https://api.smritea.ai");
  return {
    studioAccessToken,
    selectedAppId,
    selectedAppAPIKey,
    projectName,
    dataBaseUrl,
    studioBaseUrl,
    apiKey: selectedAppAPIKey,
    appId: selectedAppId
  };
}

// scripts/lib/format-context.js
function formatContext(results, options = {}) {
  const maxItems = options.maxItems ?? 10;
  if (!results || results.length === 0) {
    return "";
  }
  const sorted = [...results].sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
  const lines = [];
  let count = 0;
  for (const result of sorted) {
    if (count >= maxItems) break;
    const content = result?.memory?.content;
    if (!content) continue;
    const actor = result.memory?.actorType;
    const actorTag = actor ? ` [${actor}]` : "";
    const score = result.score != null ? `${Math.round(result.score * 100)}%` : "?%";
    lines.push(`${actorTag} ${content} [${score}]`);
    count++;
  }
  if (lines.length === 0) {
    return "";
  }
  return [
    "<smritea-context>",
    "--- Relevant Memories ---",
    ...lines,
    "",
    "Use these memories naturally \u2014 don't force them into the conversation.",
    "</smritea-context>"
  ].join("\n");
}

// ../../polyglot/smritea-sdk/typescript/dist/index.mjs
var BASE_PATH = "http://api.smritea.ai/api/v1".replace(/\/+$/, "");
var Configuration = class {
  constructor(configuration = {}) {
    this.configuration = configuration;
  }
  set config(configuration) {
    this.configuration = configuration;
  }
  get basePath() {
    return this.configuration.basePath != null ? this.configuration.basePath : BASE_PATH;
  }
  get fetchApi() {
    return this.configuration.fetchApi;
  }
  get middleware() {
    return this.configuration.middleware || [];
  }
  get queryParamsStringify() {
    return this.configuration.queryParamsStringify || querystring;
  }
  get username() {
    return this.configuration.username;
  }
  get password() {
    return this.configuration.password;
  }
  get apiKey() {
    const apiKey = this.configuration.apiKey;
    if (apiKey) {
      return typeof apiKey === "function" ? apiKey : () => apiKey;
    }
    return void 0;
  }
  get accessToken() {
    const accessToken = this.configuration.accessToken;
    if (accessToken) {
      return typeof accessToken === "function" ? accessToken : async () => accessToken;
    }
    return void 0;
  }
  get headers() {
    return this.configuration.headers;
  }
  get credentials() {
    return this.configuration.credentials;
  }
};
var DefaultConfig = new Configuration();
var BaseAPI = class _BaseAPI {
  constructor(configuration = DefaultConfig) {
    this.configuration = configuration;
    this.middleware = configuration.middleware;
  }
  static jsonRegex = new RegExp("^(:?application/json|[^;/ 	]+/[^;/ 	]+[+]json)[ 	]*(:?;.*)?$", "i");
  middleware;
  withMiddleware(...middlewares) {
    const next = this.clone();
    next.middleware = next.middleware.concat(...middlewares);
    return next;
  }
  withPreMiddleware(...preMiddlewares) {
    const middlewares = preMiddlewares.map((pre) => ({ pre }));
    return this.withMiddleware(...middlewares);
  }
  withPostMiddleware(...postMiddlewares) {
    const middlewares = postMiddlewares.map((post) => ({ post }));
    return this.withMiddleware(...middlewares);
  }
  /**
   * Check if the given MIME is a JSON MIME.
   * JSON MIME examples:
   *   application/json
   *   application/json; charset=UTF8
   *   APPLICATION/JSON
   *   application/vnd.company+json
   * @param mime - MIME (Multipurpose Internet Mail Extensions)
   * @return True if the given MIME is JSON, false otherwise.
   */
  isJsonMime(mime) {
    if (!mime) {
      return false;
    }
    return _BaseAPI.jsonRegex.test(mime);
  }
  async request(context, initOverrides) {
    const { url, init } = await this.createFetchParams(context, initOverrides);
    const response = await this.fetchApi(url, init);
    if (response && (response.status >= 200 && response.status < 300)) {
      return response;
    }
    throw new ResponseError(response, "Response returned an error code");
  }
  async createFetchParams(context, initOverrides) {
    let url = this.configuration.basePath + context.path;
    if (context.query !== void 0 && Object.keys(context.query).length !== 0) {
      url += "?" + this.configuration.queryParamsStringify(context.query);
    }
    const headers = Object.assign({}, this.configuration.headers, context.headers);
    Object.keys(headers).forEach((key) => headers[key] === void 0 ? delete headers[key] : {});
    const initOverrideFn = typeof initOverrides === "function" ? initOverrides : async () => initOverrides;
    const initParams = {
      method: context.method,
      headers,
      body: context.body,
      credentials: this.configuration.credentials
    };
    const overriddenInit = {
      ...initParams,
      ...await initOverrideFn({
        init: initParams,
        context
      })
    };
    let body;
    if (isFormData(overriddenInit.body) || overriddenInit.body instanceof URLSearchParams || isBlob(overriddenInit.body)) {
      body = overriddenInit.body;
    } else if (this.isJsonMime(headers["Content-Type"])) {
      body = JSON.stringify(overriddenInit.body);
    } else {
      body = overriddenInit.body;
    }
    const init = {
      ...overriddenInit,
      body
    };
    return { url, init };
  }
  fetchApi = async (url, init) => {
    let fetchParams = { url, init };
    for (const middleware of this.middleware) {
      if (middleware.pre) {
        fetchParams = await middleware.pre({
          fetch: this.fetchApi,
          ...fetchParams
        }) || fetchParams;
      }
    }
    let response = void 0;
    try {
      response = await (this.configuration.fetchApi || fetch)(fetchParams.url, fetchParams.init);
    } catch (e) {
      for (const middleware of this.middleware) {
        if (middleware.onError) {
          response = await middleware.onError({
            fetch: this.fetchApi,
            url: fetchParams.url,
            init: fetchParams.init,
            error: e,
            response: response ? response.clone() : void 0
          }) || response;
        }
      }
      if (response === void 0) {
        if (e instanceof Error) {
          throw new FetchError(e, "The request failed and the interceptors did not return an alternative response");
        } else {
          throw e;
        }
      }
    }
    for (const middleware of this.middleware) {
      if (middleware.post) {
        response = await middleware.post({
          fetch: this.fetchApi,
          url: fetchParams.url,
          init: fetchParams.init,
          response: response.clone()
        }) || response;
      }
    }
    return response;
  };
  /**
   * Create a shallow clone of `this` by constructing a new instance
   * and then shallow cloning data members.
   */
  clone() {
    const constructor = this.constructor;
    const next = new constructor(this.configuration);
    next.middleware = this.middleware.slice();
    return next;
  }
};
function isBlob(value) {
  return typeof Blob !== "undefined" && value instanceof Blob;
}
function isFormData(value) {
  return typeof FormData !== "undefined" && value instanceof FormData;
}
var ResponseError = class extends Error {
  constructor(response, msg) {
    super(msg);
    this.response = response;
  }
  name = "ResponseError";
};
var FetchError = class extends Error {
  constructor(cause, msg) {
    super(msg);
    this.cause = cause;
  }
  name = "FetchError";
};
var RequiredError = class extends Error {
  constructor(field, msg) {
    super(msg);
    this.field = field;
  }
  name = "RequiredError";
};
function querystring(params, prefix = "") {
  return Object.keys(params).map((key) => querystringSingleKey(key, params[key], prefix)).filter((part) => part.length > 0).join("&");
}
function querystringSingleKey(key, value, keyPrefix = "") {
  const fullKey = keyPrefix + (keyPrefix.length ? `[${key}]` : key);
  if (value instanceof Array) {
    const multiValue = value.map((singleValue) => encodeURIComponent(String(singleValue))).join(`&${encodeURIComponent(fullKey)}=`);
    return `${encodeURIComponent(fullKey)}=${multiValue}`;
  }
  if (value instanceof Set) {
    const valueAsArray = Array.from(value);
    return querystringSingleKey(key, valueAsArray, keyPrefix);
  }
  if (value instanceof Date) {
    return `${encodeURIComponent(fullKey)}=${encodeURIComponent(value.toISOString())}`;
  }
  if (value instanceof Object) {
    return querystring(value, fullKey);
  }
  return `${encodeURIComponent(fullKey)}=${encodeURIComponent(String(value))}`;
}
var JSONApiResponse = class {
  constructor(raw, transformer = (jsonValue) => jsonValue) {
    this.raw = raw;
    this.transformer = transformer;
  }
  async value() {
    return this.transformer(await this.raw.json());
  }
};
var VoidApiResponse = class {
  constructor(raw) {
    this.raw = raw;
  }
  async value() {
    return void 0;
  }
};
function PersonaDomainConfigToJSON(json) {
  return PersonaDomainConfigToJSONTyped(json, false);
}
function PersonaDomainConfigToJSONTyped(value, ignoreDiscriminator = false) {
  if (value == null) {
    return value;
  }
  return {
    "description": value["description"],
    "is_default": value["isDefault"],
    "name": value["name"],
    "traits": value["traits"]
  };
}
function PersonaExtractionConfigToJSON(json) {
  return PersonaExtractionConfigToJSONTyped(json, false);
}
function PersonaExtractionConfigToJSONTyped(value, ignoreDiscriminator = false) {
  if (value == null) {
    return value;
  }
  return {
    "actor_types": value["actorTypes"],
    "domains": value["domains"] == null ? void 0 : value["domains"].map(PersonaDomainConfigToJSON),
    "enabled": value["enabled"],
    "max_tokens": value["maxTokens"],
    "model": value["model"],
    "temperature": value["temperature"]
  };
}
function FactExtractionConfigToJSON(json) {
  return FactExtractionConfigToJSONTyped(json, false);
}
function FactExtractionConfigToJSONTyped(value, ignoreDiscriminator = false) {
  if (value == null) {
    return value;
  }
  return {
    "max_passes": value["maxPasses"],
    "max_tokens": value["maxTokens"],
    "min_importance": value["minImportance"],
    "model": value["model"],
    "strategy": value["strategy"],
    "temperature": value["temperature"]
  };
}
function RelativeStandingConfigFromJSON(json) {
  return RelativeStandingConfigFromJSONTyped(json, false);
}
function RelativeStandingConfigFromJSONTyped(json, ignoreDiscriminator) {
  if (json == null) {
    return json;
  }
  return {
    "decayFactor": json["decay_factor"] == null ? void 0 : json["decay_factor"],
    "decayFunction": json["decay_function"] == null ? void 0 : json["decay_function"],
    "importance": json["importance"] == null ? void 0 : json["importance"]
  };
}
function RelativeStandingConfigToJSON(json) {
  return RelativeStandingConfigToJSONTyped(json, false);
}
function RelativeStandingConfigToJSONTyped(value, ignoreDiscriminator = false) {
  if (value == null) {
    return value;
  }
  return {
    "decay_factor": value["decayFactor"],
    "decay_function": value["decayFunction"],
    "importance": value["importance"]
  };
}
function MemoryScopeFromJSON(json) {
  return MemoryScopeFromJSONTyped(json, false);
}
function MemoryScopeFromJSONTyped(json, ignoreDiscriminator) {
  if (json == null) {
    return json;
  }
  return {
    "actorId": json["actor_id"] == null ? void 0 : json["actor_id"],
    "actorName": json["actor_name"] == null ? void 0 : json["actor_name"],
    "actorType": json["actor_type"] == null ? void 0 : json["actor_type"],
    "conversationId": json["conversation_id"] == null ? void 0 : json["conversation_id"],
    "participantIds": json["participant_ids"] == null ? void 0 : json["participant_ids"],
    "sourceType": json["source_type"] == null ? void 0 : json["source_type"]
  };
}
function MemoryScopeToJSON(json) {
  return MemoryScopeToJSONTyped(json, false);
}
function MemoryScopeToJSONTyped(value, ignoreDiscriminator = false) {
  if (value == null) {
    return value;
  }
  return {
    "actor_id": value["actorId"],
    "actor_name": value["actorName"],
    "actor_type": value["actorType"],
    "conversation_id": value["conversationId"],
    "participant_ids": value["participantIds"],
    "source_type": value["sourceType"]
  };
}
function EntityExtractionConfigToJSON(json) {
  return EntityExtractionConfigToJSONTyped(json, false);
}
function EntityExtractionConfigToJSONTyped(value, ignoreDiscriminator = false) {
  if (value == null) {
    return value;
  }
  return {
    "context_window": value["contextWindow"],
    "enable_context": value["enableContext"],
    "entity_types": value["entityTypes"],
    "fallback_messages": value["fallbackMessages"],
    "max_passes": value["maxPasses"],
    "max_tokens": value["maxTokens"],
    "min_confidence": value["minConfidence"],
    "model": value["model"],
    "temperature": value["temperature"]
  };
}
function CreateMemoryRequestToJSON(json) {
  return CreateMemoryRequestToJSONTyped(json, false);
}
function CreateMemoryRequestToJSONTyped(value, ignoreDiscriminator = false) {
  if (value == null) {
    return value;
  }
  return {
    "app_id": value["appId"],
    "content": value["content"],
    "entity_extraction_overrides": EntityExtractionConfigToJSON(value["entityExtractionOverrides"]),
    "event_occurred_at": value["eventOccurredAt"],
    "fact_extraction_overrides": FactExtractionConfigToJSON(value["factExtractionOverrides"]),
    "metadata": value["metadata"],
    "persona_extraction_overrides": PersonaExtractionConfigToJSON(value["personaExtractionOverrides"]),
    "relative_standing": RelativeStandingConfigToJSON(value["relativeStanding"]),
    "scope": MemoryScopeToJSON(value["scope"])
  };
}
function MemoryResponseFromJSON(json) {
  return MemoryResponseFromJSONTyped(json, false);
}
function MemoryResponseFromJSONTyped(json, ignoreDiscriminator) {
  if (json == null) {
    return json;
  }
  return {
    "activeFrom": json["active_from"] == null ? void 0 : json["active_from"],
    "activeTo": json["active_to"] == null ? void 0 : json["active_to"],
    "appId": json["app_id"] == null ? void 0 : json["app_id"],
    "content": json["content"] == null ? void 0 : json["content"],
    "createdAt": json["created_at"] == null ? void 0 : json["created_at"],
    "id": json["id"] == null ? void 0 : json["id"],
    "metadata": json["metadata"] == null ? void 0 : json["metadata"],
    "relativeStanding": json["relative_standing"] == null ? void 0 : RelativeStandingConfigFromJSON(json["relative_standing"]),
    "scope": json["scope"] == null ? void 0 : MemoryScopeFromJSON(json["scope"]),
    "updatedAt": json["updated_at"] == null ? void 0 : json["updated_at"]
  };
}
function StepTraceFromJSON(json) {
  return StepTraceFromJSONTyped(json, false);
}
function StepTraceFromJSONTyped(json, ignoreDiscriminator) {
  if (json == null) {
    return json;
  }
  return {
    "durationMs": json["duration_ms"] == null ? void 0 : json["duration_ms"],
    "error": json["error"] == null ? void 0 : json["error"],
    "input": json["input"] == null ? void 0 : json["input"],
    "output": json["output"] == null ? void 0 : json["output"],
    "resultCount": json["result_count"] == null ? void 0 : json["result_count"],
    "stepName": json["step_name"] == null ? void 0 : json["step_name"]
  };
}
function StageTraceFromJSON(json) {
  return StageTraceFromJSONTyped(json, false);
}
function StageTraceFromJSONTyped(json, ignoreDiscriminator) {
  if (json == null) {
    return json;
  }
  return {
    "durationMs": json["duration_ms"] == null ? void 0 : json["duration_ms"],
    "error": json["error"] == null ? void 0 : json["error"],
    "input": json["input"] == null ? void 0 : json["input"],
    "output": json["output"] == null ? void 0 : json["output"],
    "resultCount": json["result_count"] == null ? void 0 : json["result_count"],
    "stageName": json["stage_name"] == null ? void 0 : json["stage_name"],
    "steps": json["steps"] == null ? void 0 : json["steps"].map(StepTraceFromJSON)
  };
}
function TraceFromJSON(json) {
  return TraceFromJSONTyped(json, false);
}
function TraceFromJSONTyped(json, ignoreDiscriminator) {
  if (json == null) {
    return json;
  }
  return {
    "stages": json["stages"] == null ? void 0 : json["stages"].map(StageTraceFromJSON),
    "totalMs": json["total_ms"] == null ? void 0 : json["total_ms"]
  };
}
function CreateMemoryResponseFromJSON(json) {
  return CreateMemoryResponseFromJSONTyped(json, false);
}
function CreateMemoryResponseFromJSONTyped(json, ignoreDiscriminator) {
  if (json == null) {
    return json;
  }
  return {
    "explainTrace": json["explain_trace"] == null ? void 0 : TraceFromJSON(json["explain_trace"]),
    "explicitSkip": json["explicit_skip"] == null ? void 0 : json["explicit_skip"],
    "factsExtracted": json["facts_extracted"] == null ? void 0 : json["facts_extracted"],
    "memories": json["memories"] == null ? void 0 : json["memories"].map(MemoryResponseFromJSON),
    "skippedCount": json["skipped_count"] == null ? void 0 : json["skipped_count"],
    "updatedCount": json["updated_count"] == null ? void 0 : json["updated_count"]
  };
}
function RerankerTypeToJSON(value) {
  return value;
}
function SearchMemoryResultFromJSON(json) {
  return SearchMemoryResultFromJSONTyped(json, false);
}
function SearchMemoryResultFromJSONTyped(json, ignoreDiscriminator) {
  if (json == null) {
    return json;
  }
  return {
    "activeFrom": json["active_from"] == null ? void 0 : json["active_from"],
    "activeTo": json["active_to"] == null ? void 0 : json["active_to"],
    "content": json["content"] == null ? void 0 : json["content"],
    "id": json["id"] == null ? void 0 : json["id"],
    "metadata": json["metadata"] == null ? void 0 : json["metadata"],
    "scope": json["scope"] == null ? void 0 : MemoryScopeFromJSON(json["scope"])
  };
}
function SearchMemoryResponseFromJSON(json) {
  return SearchMemoryResponseFromJSONTyped(json, false);
}
function SearchMemoryResponseFromJSONTyped(json, ignoreDiscriminator) {
  if (json == null) {
    return json;
  }
  return {
    "memory": json["memory"] == null ? void 0 : SearchMemoryResultFromJSON(json["memory"]),
    "score": json["score"] == null ? void 0 : json["score"]
  };
}
function SearchMemoriesResponseFromJSON(json) {
  return SearchMemoriesResponseFromJSONTyped(json, false);
}
function SearchMemoriesResponseFromJSONTyped(json, ignoreDiscriminator) {
  if (json == null) {
    return json;
  }
  return {
    "explainTrace": json["explain_trace"] == null ? void 0 : TraceFromJSON(json["explain_trace"]),
    "memories": json["memories"] == null ? void 0 : json["memories"].map(SearchMemoryResponseFromJSON)
  };
}
function SearchMethodToJSON(value) {
  return value;
}
function SearchMemoryRequestToJSON(json) {
  return SearchMemoryRequestToJSONTyped(json, false);
}
function SearchMemoryRequestToJSONTyped(value, ignoreDiscriminator = false) {
  if (value == null) {
    return value;
  }
  return {
    "app_id": value["appId"],
    "from_time": value["fromTime"],
    "graph_depth": value["graphDepth"],
    "limit": value["limit"],
    "metadata_filter": value["metadataFilter"],
    "method": SearchMethodToJSON(value["method"]),
    "query": value["query"],
    "reranker_type": RerankerTypeToJSON(value["rerankerType"]),
    "scope": MemoryScopeToJSON(value["scope"]),
    "threshold": value["threshold"],
    "to_time": value["toTime"],
    "valid_at": value["validAt"]
  };
}
var SDKMemoryApi = class extends BaseAPI {
  /**
   * Creates request options for createMemory without sending the request
   */
  async createMemoryRequestOpts(requestParameters) {
    if (requestParameters["request"] == null) {
      throw new RequiredError(
        "request",
        'Required parameter "request" was null or undefined when calling createMemory().'
      );
    }
    const queryParameters = {};
    const headerParameters = {};
    headerParameters["Content-Type"] = "application/json";
    if (this.configuration && this.configuration.apiKey) {
      headerParameters["X-API-Key"] = await this.configuration.apiKey("X-API-Key");
    }
    let urlPath = `/api/v1/sdk/memories`;
    return {
      path: urlPath,
      method: "POST",
      headers: headerParameters,
      query: queryParameters,
      body: CreateMemoryRequestToJSON(requestParameters["request"])
    };
  }
  /**
   * Create a new memory with quota and rate limit enforcement
   * Create memory (SDK)
   */
  async createMemoryRaw(requestParameters, initOverrides) {
    const requestOptions = await this.createMemoryRequestOpts(requestParameters);
    const response = await this.request(requestOptions, initOverrides);
    return new JSONApiResponse(response, (jsonValue) => CreateMemoryResponseFromJSON(jsonValue));
  }
  /**
   * Create a new memory with quota and rate limit enforcement
   * Create memory (SDK)
   */
  async createMemory(requestParameters, initOverrides) {
    const response = await this.createMemoryRaw(requestParameters, initOverrides);
    return await response.value();
  }
  /**
   * Creates request options for deleteMemory without sending the request
   */
  async deleteMemoryRequestOpts(requestParameters) {
    if (requestParameters["memoryId"] == null) {
      throw new RequiredError(
        "memoryId",
        'Required parameter "memoryId" was null or undefined when calling deleteMemory().'
      );
    }
    const queryParameters = {};
    const headerParameters = {};
    if (this.configuration && this.configuration.apiKey) {
      headerParameters["X-API-Key"] = await this.configuration.apiKey("X-API-Key");
    }
    let urlPath = `/api/v1/sdk/memories/{memory_id}`;
    urlPath = urlPath.replace(`{${"memory_id"}}`, encodeURIComponent(String(requestParameters["memoryId"])));
    return {
      path: urlPath,
      method: "DELETE",
      headers: headerParameters,
      query: queryParameters
    };
  }
  /**
   * Delete a memory by ID with rate limit enforcement
   * Delete memory (SDK)
   */
  async deleteMemoryRaw(requestParameters, initOverrides) {
    const requestOptions = await this.deleteMemoryRequestOpts(requestParameters);
    const response = await this.request(requestOptions, initOverrides);
    return new VoidApiResponse(response);
  }
  /**
   * Delete a memory by ID with rate limit enforcement
   * Delete memory (SDK)
   */
  async deleteMemory(requestParameters, initOverrides) {
    await this.deleteMemoryRaw(requestParameters, initOverrides);
  }
  /**
   * Creates request options for getMemory without sending the request
   */
  async getMemoryRequestOpts(requestParameters) {
    if (requestParameters["memoryId"] == null) {
      throw new RequiredError(
        "memoryId",
        'Required parameter "memoryId" was null or undefined when calling getMemory().'
      );
    }
    const queryParameters = {};
    const headerParameters = {};
    if (this.configuration && this.configuration.apiKey) {
      headerParameters["X-API-Key"] = await this.configuration.apiKey("X-API-Key");
    }
    let urlPath = `/api/v1/sdk/memories/{memory_id}`;
    urlPath = urlPath.replace(`{${"memory_id"}}`, encodeURIComponent(String(requestParameters["memoryId"])));
    return {
      path: urlPath,
      method: "GET",
      headers: headerParameters,
      query: queryParameters
    };
  }
  /**
   * Get a single memory by ID with rate limit enforcement
   * Get memory by ID (SDK)
   */
  async getMemoryRaw(requestParameters, initOverrides) {
    const requestOptions = await this.getMemoryRequestOpts(requestParameters);
    const response = await this.request(requestOptions, initOverrides);
    return new JSONApiResponse(response, (jsonValue) => MemoryResponseFromJSON(jsonValue));
  }
  /**
   * Get a single memory by ID with rate limit enforcement
   * Get memory by ID (SDK)
   */
  async getMemory(requestParameters, initOverrides) {
    const response = await this.getMemoryRaw(requestParameters, initOverrides);
    return await response.value();
  }
  /**
   * Creates request options for searchMemories without sending the request
   */
  async searchMemoriesRequestOpts(requestParameters) {
    if (requestParameters["request"] == null) {
      throw new RequiredError(
        "request",
        'Required parameter "request" was null or undefined when calling searchMemories().'
      );
    }
    const queryParameters = {};
    const headerParameters = {};
    headerParameters["Content-Type"] = "application/json";
    if (this.configuration && this.configuration.apiKey) {
      headerParameters["X-API-Key"] = await this.configuration.apiKey("X-API-Key");
    }
    let urlPath = `/api/v1/sdk/memories/search`;
    return {
      path: urlPath,
      method: "POST",
      headers: headerParameters,
      query: queryParameters,
      body: SearchMemoryRequestToJSON(requestParameters["request"])
    };
  }
  /**
   * Search memories with quota and rate limit enforcement
   * Search memories (SDK)
   */
  async searchMemoriesRaw(requestParameters, initOverrides) {
    const requestOptions = await this.searchMemoriesRequestOpts(requestParameters);
    const response = await this.request(requestOptions, initOverrides);
    return new JSONApiResponse(response, (jsonValue) => SearchMemoriesResponseFromJSON(jsonValue));
  }
  /**
   * Search memories with quota and rate limit enforcement
   * Search memories (SDK)
   */
  async searchMemories(requestParameters, initOverrides) {
    const response = await this.searchMemoriesRaw(requestParameters, initOverrides);
    return await response.value();
  }
};
var SmriteaError = class extends Error {
  statusCode;
  errorCode;
  body;
  constructor(message, statusCode, errorCode, body) {
    super(message);
    this.name = "SmriteaError";
    this.statusCode = statusCode;
    this.errorCode = errorCode ?? "INTERNAL_ERROR";
    this.body = body;
    Object.setPrototypeOf(this, new.target.prototype);
  }
};
var SmriteaAuthError = class extends SmriteaError {
  constructor(message, statusCode, errorCode, body) {
    super(message, statusCode ?? 401, errorCode, body);
    this.name = "SmriteaAuthError";
    Object.setPrototypeOf(this, new.target.prototype);
  }
};
var SmriteaNotFoundError = class extends SmriteaError {
  constructor(message, statusCode, errorCode, body) {
    super(message, statusCode ?? 404, errorCode, body);
    this.name = "SmriteaNotFoundError";
    Object.setPrototypeOf(this, new.target.prototype);
  }
};
var SmriteaValidationError = class extends SmriteaError {
  constructor(message, statusCode, errorCode, body) {
    super(message, statusCode ?? 400, errorCode, body);
    this.name = "SmriteaValidationError";
    Object.setPrototypeOf(this, new.target.prototype);
  }
};
var SmriteaQuotaError = class extends SmriteaError {
  constructor(message, statusCode, errorCode, body) {
    super(message, statusCode ?? 402, errorCode, body);
    this.name = "SmriteaQuotaError";
    Object.setPrototypeOf(this, new.target.prototype);
  }
};
var SmriteaRateLimitError = class extends SmriteaError {
  retryAfter;
  constructor(message, statusCode, retryAfter, errorCode, body) {
    super(message, statusCode ?? 429, errorCode, body);
    this.name = "SmriteaRateLimitError";
    this.retryAfter = retryAfter;
    Object.setPrototypeOf(this, new.target.prototype);
  }
};
var RETRY_CAP_MS = 3e4;
var SmriteaClient = class {
  appId;
  api;
  maxRetries;
  constructor(config) {
    this.appId = config.appId;
    this.maxRetries = config.maxRetries ?? 2;
    const configuration = new Configuration({
      basePath: config.baseUrl?.replace(/\/$/, "") ?? "https://api-us.smritea.ai",
      apiKey: config.apiKey
    });
    this.api = new SDKMemoryApi(configuration);
  }
  async add(content, options) {
    if (options?.metadata !== void 0) {
      const m = options.metadata;
      if (typeof m !== "object" || m === null || Array.isArray(m)) {
        throw new SmriteaValidationError("metadata must be a plain object (dictionary)", 400);
      }
    }
    return this.withRetry(
      () => this.api.createMemory({
        request: {
          appId: this.appId,
          content,
          scope: options?.scope ? {
            actorId: options.scope.actorId,
            actorType: options.scope.actorType,
            actorName: options.scope.actorName,
            conversationId: options.scope.conversationId,
            sourceType: options.scope.sourceType,
            participantIds: options.scope.participantIds
          } : void 0,
          metadata: options?.metadata,
          eventOccurredAt: options?.eventOccurredAt,
          relativeStanding: options?.relativeStanding ? {
            importance: options.relativeStanding.importance,
            decayFactor: options.relativeStanding.decayFactor,
            decayFunction: options.relativeStanding.decayFunction
          } : void 0
        }
      })
    );
  }
  async search(query, options) {
    const response = await this.withRetry(
      () => this.api.searchMemories({
        request: {
          appId: this.appId,
          query,
          scope: options?.scope ? {
            actorId: options.scope.actorId,
            actorType: options.scope.actorType,
            conversationId: options.scope.conversationId,
            participantIds: options.scope.participantIds
          } : void 0,
          limit: options?.limit,
          threshold: options?.threshold,
          graphDepth: options?.graphDepth,
          fromTime: options?.fromTime,
          toTime: options?.toTime,
          validAt: options?.validAt,
          method: options?.method,
          rerankerType: options?.rerankerType,
          metadataFilter: options?.metadataFilter
        }
      })
    );
    return response.memories ?? [];
  }
  async get(memoryId) {
    return this.withRetry(() => this.api.getMemory({ memoryId }));
  }
  async delete(memoryId) {
    await this.withRetry(() => this.api.deleteMemory({ memoryId }));
  }
  async getAll(options) {
    throw new Error(
      "getAll() is not yet available. The list memories endpoint is pending dashboard testing. Use search() to find specific memories."
    );
  }
  // ------------------------------------------------------------------
  // Private helpers
  // ------------------------------------------------------------------
  /**
   * Execute fn, retrying on HTTP 429 up to maxRetries times.
   *
   * Sleep strategy per attempt:
   * 1. Retry-After header value (seconds), capped at 30 s.
   * 2. Exponential backoff (1 s, 2 s, 4 s, …) with ±25 % jitter, capped at 30 s.
   *
   * After all retries are exhausted the 429 is re-raised as SmriteaRateLimitError
   * with retryAfter populated from the final response header if available.
   */
  async withRetry(fn) {
    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        return await fn();
      } catch (err) {
        if (err instanceof ResponseError && err.response.status === 429 && attempt < this.maxRetries) {
          await new Promise(
            (resolve) => setTimeout(resolve, this.retryDelayMs(attempt, this.parseRetryAfter(err.response)))
          );
          continue;
        }
        await this.handleError(err);
      }
    }
    throw new Error("unreachable");
  }
  /** Calculate sleep duration in milliseconds for a retry attempt. */
  retryDelayMs(attempt, retryAfterSeconds) {
    if (retryAfterSeconds !== void 0 && retryAfterSeconds > 0) {
      return Math.min(retryAfterSeconds * 0.9 * 1e3, RETRY_CAP_MS);
    }
    const baseMs = Math.min(1e3 * Math.pow(2, attempt), RETRY_CAP_MS);
    const jitter = baseMs * (0.75 + 0.5 * Math.random());
    return Math.min(jitter, RETRY_CAP_MS);
  }
  /** Extract the Retry-After header value in seconds, or undefined. */
  parseRetryAfter(response) {
    const header = response.headers.get("Retry-After");
    if (header === null) return void 0;
    const parsed = parseInt(header, 10);
    return isNaN(parsed) ? void 0 : parsed;
  }
  async handleError(err) {
    if (err instanceof ResponseError) {
      const status = err.response.status;
      const errorData = await this.extractErrorData(err.response);
      const message = errorData.message || err.message;
      const errorCode = errorData.code;
      const body = errorData.body;
      switch (status) {
        case 400:
          throw new SmriteaValidationError(message, status, errorCode, body);
        case 401:
          throw new SmriteaAuthError(message, status, errorCode, body);
        case 402:
          throw new SmriteaQuotaError(message, status, errorCode, body);
        case 404:
          throw new SmriteaNotFoundError(message, status, errorCode, body);
        case 429:
          throw new SmriteaRateLimitError(message, status, this.parseRetryAfter(err.response), errorCode, body);
        default:
          throw new SmriteaError(message, status, errorCode, body);
      }
    }
    throw new SmriteaError(String(err));
  }
  /** Attempt to extract error data ("message" and "code" fields) from the response body JSON. */
  async extractErrorData(response) {
    try {
      const body = await response.clone().json();
      if (body && typeof body === "object") {
        const message = body.message;
        const code = body.code;
        if (typeof message === "string" && message) {
          return {
            message,
            code: typeof code === "string" ? code : void 0,
            body
          };
        }
      }
      return { message: "", body };
    } catch {
    }
    return { message: "" };
  }
};

// scripts/context-hook.js
async function main() {
  const { dataBaseUrl, selectedAppAPIKey, selectedAppId } = resolveConfig();
  if (!selectedAppId) {
    console.log("[smritea] No app selected. Run /smritea:config to set an app.");
    process.exit(0);
  }
  if (!selectedAppAPIKey) {
    console.log("[smritea] Not configured. Run /smritea:login to set up.");
    process.exit(0);
  }
  const client = new SmriteaClient({
    apiKey: selectedAppAPIKey,
    appId: selectedAppId,
    baseUrl: dataBaseUrl
  });
  const results = await client.search("session context relevant memories", { limit: 10 });
  const context = formatContext(results);
  if (context) {
    console.log(context);
  }
}
main().catch((err) => {
  process.stderr.write(`[smritea] Warning: failed to load session context: ${err.message}
`);
  process.exit(0);
});
