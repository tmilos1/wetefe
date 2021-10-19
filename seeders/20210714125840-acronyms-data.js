"use strict";

const data = require("./../data/acronym.json");

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.bulkInsert(
      "Acronyms",
      data.map((el) => {
        return {
          name: Object.keys(el)[0],
          definition: Object.values(el)[0],
          createdAt: new Date(Date.now()),
          updatedAt: new Date(Date.now()),
        };
      }),
      {}
    );
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete("Acronyms", null, {});
  },
};
