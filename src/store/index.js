import Vue from "vue";
import Vuex from "vuex";
import createLogger from "vuex/dist/logger";
import axios from "axios";
import {
  oneDayCityDataAPI,
  metric,
  apiKey,
  forecastFiveDaysAPI,
  forecastTenDaysAPI,
  defaultHeaders,
  oneDayCitiDataAPIID,
  oneDayCitySeveralID
} from "../config";

Vue.use(Vuex);
export default new Vuex.Store({
  state: {
    loading: {
      homeLoading: false,
      fivedayForecastLoading: false,
      tenDaysForecastLoading: false
    },
    itemErrored: false,
    menuToggle: false,
    oneDayForecastData: "",
    fiveDaysForecastData: "",
    forecastTenDays: "",
    oneDayForecastDataSeveralID: "",
    watchList: []
    // [759734, 756135, 759734, 756135, 759734, 756135]
  },
  mutations: {
    itemLoading(state, payload) {
      state.loading = {
        ...state.loading,
        ...payload
      };
    },
    itemHasErrored(state, bool) {
      state.itemErrored = bool;
    },
    setOneDayForecastData(state, payload) {
      state.oneDayForecastData = payload;
    },
    fiveDaysForecastData(state, payload) {
      state.fiveDaysForecastData = {
        ...payload,
        list: [...payload.list.slice(0, 9)]
      };
    },
    setForecastTenDays(state, payload) {
      state.forecastTenDays = payload.list;
    },
    oneDayForecastDataSeveralID(state, payload) {
      state.oneDayForecastDataSeveralID = payload.list;
    },
    addToWatchList(state, payload) {
      const newCityID = payload.addID;
      if (!state.watchList.includes(newCityID)) {
        state.watchList.push(newCityID);
      } else {
        const index = state.watchList.indexOf(newCityID);
        state.watchList.splice(index);
      }
      if (state.oneDayForecastDataSeveralID.length) {
        state.oneDayForecastDataSeveralID = state.oneDayForecastDataSeveralID.filter(
          el => el.id !== newCityID
        );
      }
    },
    hideDetailsPanel(state, payload) {
      state.fiveDaysForecastData = payload;
      state.forecastTenDays = payload;
    },
    setWatchListFromLocalStorage(state, payload) {
      state.watchList.push(payload);
    }
  },
  actions: {
    async getOneDayData({ commit }, city) {
      commit("itemLoading", { homeLoading: true });
      axios({
        url: `${oneDayCityDataAPI}${city}${metric}${apiKey}`,
        baseURL: "https:/api.openweathermap.org/data/2.5"
      })
        .then(response => {
          console.log(response);
          return response;
        })
        .then(response => {
          if (response.status !== 200) {
            throw Error(response.statusText);
          }
          commit("itemLoading", { homeLoading: false });
          return response;
        })
        .then(response => {
          commit("setOneDayForecastData", response.data);
        })
        .catch(() => {
          commit("itemLoading", { homeLoading: false });
          commit("itemHasErrored", true);
        });
    },
    async getOneDayDataID({ commit }, city) {
      commit("itemLoading", { homeLoading: true });
      axios({
        url: `${oneDayCitySeveralID}${city}${metric}${apiKey}`,
        baseURL: "https:/api.openweathermap.org/data/2.5"
      })
        .then(response => {
          if (response.status !== 200) {
            throw Error(response.statusText);
          }
          commit("itemLoading", { homeLoading: false });
          return response;
        })
        .then(response => {
          commit("setOneDayForecastData", response.data);
        })
        .catch(() => {
          commit("itemLoading", { homeLoading: false });
          commit("itemHasErrored", true);
        });
    },
    async getSeveralIDData({ commit }, cityIDs) {
      commit("itemLoading", { homeLoading: true });
      axios(
        `https:/api.openweathermap.org/data/2.5/${oneDayCitySeveralID}${cityIDs}${metric}${apiKey}`
      )
        .then(response => {
          if (response.status !== 200) {
            throw Error(response.statusText);
          }
          commit("itemLoading", { homeLoading: false });
          return response;
        })
        .then(response => {
          commit("oneDayForecastDataSeveralID", response.data);
        })
        .catch(() => {
          commit("itemLoading", { homeLoading: false });
          commit("itemHasErrored", true);
        });
    },
    async getFiveDaysForecast({ commit }, cityID) {
      commit("itemLoading", { fivedayForecastLoading: true });
      axios
        .get(`${forecastFiveDaysAPI}${cityID}${metric}${apiKey}`)
        .then(response => {
          if (response.status !== 200) {
            throw Error(response.statusText);
          }
          commit("itemLoading", { fivedayForecastLoading: false });
          return response;
        })
        .then(response => {
          commit("fiveDaysForecastData", response.data);
        })
        .catch(() => {
          commit("itemLoading", { fivedayForecastLoading: false });
          commit("itemHasErrored", true);
        });
    },
    async getTenDaysForecast({ commit }, cityID) {
      commit("itemLoading", { tenDaysForecastLoading: true });
      axios
        .get(`${forecastTenDaysAPI}${cityID}${metric}${apiKey}&cnt=10`)
        .then(response => {
          if (response.status !== 200) {
            throw Error(response.statusText);
          }
          commit("itemLoading", { tenDaysForecastLoading: false });
          return response;
        })
        .then(response => {
          const payload = response.data;
          commit("setForecastTenDays", payload);
        })
        .catch(() => {
          commit("itemLoading", { tenDaysForecastLoading: false });
          commit("itemHasErrored", true);
        });
    },
    addToWatchList(store, payload) {
      store.commit({
        type: "addToWatchList",
        addID: payload
      });
    },
    hideDetailsPanel(store) {
      store.commit("hideDetailsPanel", false);
    },
    setWatchListFromLocalStorage(store, payload) {
      store.commit("setWatchListFromLocalStorage", payload);
    }
  },
  plugins: [createLogger()]
});
