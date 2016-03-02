define(<%=dependencies%>, function() {
  var Prototypes = arguments,
      markup = Prototypes[Prototypes.length-1],
      stones = [],
      prototypes = {},
      templates = {},
      i, p;

  for(i in Prototypes) {
    p = Prototypes[i];
    if(bedrock._.Stone.isPrototypeOf(p)) {
      stones.push(p.type);
      prototypes[p.type] = p.init();
    }
  }

  $(markup).find('[data-template-id]').each(function(i, v) {
    templates[v.getAttribute('data-template-id').replace(/^stone-/, '')] = bedrock.handlebars.compile($(v).html());
  });

  return {
    pile: '<%=pileSource%>',
    prototypes: prototypes,
    templates: templates,
    stoneTypes: stones
  };
});
