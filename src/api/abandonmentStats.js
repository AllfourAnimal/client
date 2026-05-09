import axios from "axios";

const API_BASE_URL = "https://apis.data.go.kr/1543061";
const ABANDONMENT_SERVICE_PATH =
  "abandonmentPublicService_v2/abandonmentPublic_v2";
const SIDO_SERVICE_PATH = "abandonmentPublicService_v2/sido_v2";
const SIGUNGU_SERVICE_PATH = "abandonmentPublicService_v2/sigungu_v2";
const SHELTER_SERVICE_PATH = "abandonmentPublicService_v2/shelter_v2";
const SERVICE_KEY =
  "39bc66238992a14aa753983bbb0a0581936d216876a6d6de03584f406e535a8f";
const DEFAULT_PAGE_SIZE = 1000;
const SHELTER_COUNT_CACHE_KEY = "all4animal:shelterCount";
const SHELTER_COUNT_CACHE_TTL = 1000 * 60 * 60 * 24;

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}${month}${day}`;
}

function getTotalCount(data) {
  const totalCount = data?.response?.body?.totalCount;
  const parsedCount = Number(totalCount);

  if (Number.isNaN(parsedCount)) {
    return 0;
  }

  return parsedCount;
}

async function fetchPublicData(path, params = {}) {
  const response = await axios.get(`${API_BASE_URL}/${path}`, {
    params: {
      serviceKey: SERVICE_KEY,
      pageNo: 1,
      numOfRows: DEFAULT_PAGE_SIZE,
      _type: "json",
      ...params,
    },
  });

  return response.data;
}

function getItems(data) {
  const items = data?.response?.body?.items?.item;

  if (!items) {
    return [];
  }

  return Array.isArray(items) ? items : [items];
}

async function runInBatches(items, batchSize, task) {
  const results = [];

  for (let index = 0; index < items.length; index += batchSize) {
    const batch = items.slice(index, index + batchSize);
    const batchResults = await Promise.allSettled(batch.map(task));
    results.push(
      ...batchResults
        .filter((result) => result.status === "fulfilled")
        .map((result) => result.value)
    );
  }

  return results;
}

function getCachedShelterCount() {
  if (typeof localStorage === "undefined") {
    return null;
  }

  try {
    const cached = JSON.parse(localStorage.getItem(SHELTER_COUNT_CACHE_KEY));

    if (
      typeof cached?.count === "number" &&
      Date.now() - cached.cachedAt < SHELTER_COUNT_CACHE_TTL
    ) {
      return cached.count;
    }
  } catch (error) {
    try {
      localStorage.removeItem(SHELTER_COUNT_CACHE_KEY);
    } catch {
      return null;
    }
  }

  return null;
}

function setCachedShelterCount(count) {
  if (typeof localStorage === "undefined") {
    return;
  }

  try {
    localStorage.setItem(
      SHELTER_COUNT_CACHE_KEY,
      JSON.stringify({
        count,
        cachedAt: Date.now(),
      })
    );
  } catch {
    // localStorage can be unavailable in private browsing or restricted contexts.
  }
}

export async function fetchThisYearRescueCount() {
  const today = new Date();
  const startOfYear = new Date(today.getFullYear(), 0, 1);
  const data = await fetchPublicData(ABANDONMENT_SERVICE_PATH, {
    bgnde: formatDate(startOfYear),
    endde: formatDate(today),
    numOfRows: 1,
  });

  return getTotalCount(data);
}

export async function fetchShelterCount() {
  const cachedCount = getCachedShelterCount();

  if (cachedCount !== null) {
    return cachedCount;
  }

  const sidoData = await fetchPublicData(SIDO_SERVICE_PATH);
  const sidos = getItems(sidoData);
  const sigunguGroups = await runInBatches(sidos, 3, async (sido) => {
    const data = await fetchPublicData(SIGUNGU_SERVICE_PATH, {
      upr_cd: sido.orgCd,
    });

    return getItems(data);
  });
  const sigungus = sigunguGroups.flat();
  const shelterGroups = await runInBatches(sigungus, 3, async (sigungu) => {
    const data = await fetchPublicData(SHELTER_SERVICE_PATH, {
      upr_cd: sigungu.uprCd,
      org_cd: sigungu.orgCd,
    });

    return getItems(data);
  });
  const shelterIds = new Set(
    shelterGroups
      .flat()
      .map((shelter) => shelter.careRegNo || shelter.careNm)
      .filter(Boolean)
  );

  setCachedShelterCount(shelterIds.size);

  return shelterIds.size;
}
