"use strict";

const { AdvancedEffectHandlers } = require("./advanced-effect-handlers.js");
const studioRegistry = require("../../studio-registry.js");

class EffectHandlerExtensions {
  constructor(resolver, state, cardFactory) {
    this.resolver = resolver;
    this.state = state;
    this.cards = cardFactory;
  }

  register(handlers) {
    const resolveNested = (effects, context) =>
      this.resolver.resolve(effects, context);
    const groups = [
      new AdvancedEffectHandlers(this.state, this.cards),
      ...studioRegistry.effectHandlerClasses.map(
        (HandlerClass) =>
          new HandlerClass(this.state, this.cards, resolveNested),
      ),
    ];
    for (const group of groups) {
      for (const [type, handler] of group.registry()) {
        handlers.set(type, handler);
      }
    }
  }
}

module.exports = { EffectHandlerExtensions };
