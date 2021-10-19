const Acronym = require("../../db-models-loader").Acronym;
const { Op } = require("sequelize");

exports.search = async (from, limit, search) => {
  let where = null;

  if (search) {
    let searchString = "%" + search + "%";

    where = { name: { [Op.like]: searchString } };
  }

  const { count, rows } = await Acronym.findAndCountAll({
    where,
    offset: from,
    limit: limit,
  });

  return {
    count,
    rows: rows.map((record) => {
      return {
        name: record.name,
        definition: record.definition,
      };
    }),
  };
};

exports.insert = async (name, definition) => {
  const inserted = await Acronym.create({ name, definition });

  return {
    id: inserted.id,
    name: inserted.name,
    definition: inserted.definition,
  };
};

exports.update = async (name, definition) => {
  const acronym = await Acronym.findOne({ where: { name } });

  if (acronym === null) {
    return;
  }

  acronym.definition = definition;
  await acronym.save();

  return acronym;
};

exports.delete = async (name) => {
  const acronym = await Acronym.findOne({ where: { name } });

  if (acronym === null) {
    return;
  }

  await acronym.destroy();

  return true;
};
