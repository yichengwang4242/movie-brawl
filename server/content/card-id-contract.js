"use strict";

const { createHash } = require("node:crypto");

const CARD_ID_CONTRACT_VERSION = 2;
const EXPECTED_CARD_COUNT = 195;
const EXPECTED_CARD_ID_HASH =
  "5c97d9fcadbe806425efde8c7288a103cca500204bbfe5eafac53ef4a53c9402";

function cardIdHash(cards) {
  return createHash("sha256")
    .update(cards.map((card) => card.id).sort().join("\n"))
    .digest("hex");
}

function validateCardIdContract(cards) {
  const ids = cards.map((card) => card.id);
  if (ids.some((id) => typeof id !== "string" || !id)) {
    throw new Error("Every card must have a stable ID.");
  }
  if (new Set(ids).size !== ids.length) {
    throw new Error("Card registry contains duplicate IDs.");
  }
  if (
    cards.length !== EXPECTED_CARD_COUNT ||
    cardIdHash(cards) !== EXPECTED_CARD_ID_HASH
  ) {
    throw new Error(
      `Card ID contract v${CARD_ID_CONTRACT_VERSION} changed. Add an ID migration before updating the contract.`,
    );
  }
}

module.exports = {
  CARD_ID_CONTRACT_VERSION,
  EXPECTED_CARD_COUNT,
  EXPECTED_CARD_ID_HASH,
  cardIdHash,
  validateCardIdContract,
};
