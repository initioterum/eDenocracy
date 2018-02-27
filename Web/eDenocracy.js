//Code for collapsible graph from: https://bl.ocks.org/mbostock/4339083
//var margin = {top: 20, right: 120, bottom: 20, left: 120}, width = 960 - margin.right - margin.left, height = 800 - margin.top - margin.bottom;

var height = 780, width = 1000;

var i = 0,
    duration = 750,
    root;

var tree = d3.layout.tree()
    .size([height, width]);

var diagonal = d3.svg.diagonal()
    .source(function(d) { return {"x":d.source.x, "y":d.source.y + 100}; })            
    .target(function(d) { return {"x":d.target.x, "y":d.target.y}; })
    .projection(function(d) { return [d.y, d.x]; });

var svg = d3.select("body").append("svg")
    .style("z-index", 0)
    .attr("width", "100%")
    .attr("height", "100%")
    .append("g")
    .attr("transform", "translate(" + 80 + "," + 0 + ")");

var argumentValence = null;

//on load:
root = DATA.elements;
root.x0 = height / 2;
root.y0 = 0;
//root.children.forEach(collapse);
update(root);

var currNode = tree.nodes(root[0]);
var currArgNode;

d3.select(self.frameElement).style("height", "800px");

var ideaCard = $('#ideaCard');
var argumentCard = $('#argumentCard');
var questionCard = $('#questionCard');
var argumentFieldCard = $('#argumentFieldCard');
var force;

function makeArgumentsCard(parent){
  $("#argFieldSvg").remove();
  $('#argumentFieldHeader').text(parent.name);
  $('#argumentParentHeader').text(parent.parent.name);
  var width = $('#tenCol').width(),
      height = 400;
  //$('#argumentField').width(width);
  //$('#argumentField').height(height);

  var argumentsField = d3.select("#argumentField").append("svg").attr("id", "argFieldSvg").attr("width", "100%").attr("height", height);
  var nodes = parent.arguments;

  $('#argumentField').width = "100%";
  $('#argumentField').height = "100%";

  if (nodes == undefined) {
    argumentsField.append("text")
    .text("No arguments yet - be the first!")
    .attr("transform", ("translate(" + width/5 + "," + height/5 + ")"));
    return;
  }
  nodes.forEach(function(d) { 
    d.y = width/2,
    d.x = height/2 });


  force = d3.layout.force()
    .nodes(nodes)
    .size([width, height])
    .charge(-500)
    .gravity(0.1)
    .start()
    .on("tick", tick);

  var node = argumentsField.selectAll(".node")
  .data(nodes, function (d) {return d.id});

  var nodeEnter = node.enter().append("g")
    .attr("class", "node")
    .call(force.drag);

  nodeEnter.append("circle")
    .attr("class", "node")
    .attr("r", function(d){
      return d.size;
    })
    .style("stroke", "black")
    .style("fill", function(d) {
      if(d.valence == "for"){
        return "green";
      }
      else if(d.valence == "against"){
        return "red";
      }
    })
    .on("click", function(d) { 
      setCurrArgNode(d); 
    })
    .attr("class", "hastip")
    .attr("title", function(d) { return d.name; });

  $('.hastip').tooltipsy();

  function tick(e) {
    node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
    argumentsField.selectAll("circle").attr("r", function(d){ return d.size; });
  }
}

function collapse(d) {
  if (d.children) {
      d._children = d.children;
      d._children.forEach(collapse);
      d.children = null;
    }
  }

function update(source) {
  // Compute the new tree layout.
  var nodes = tree.nodes(root[0]).reverse(),
      links = tree.links(nodes);

  // Normalize for fixed-depth.
  nodes.forEach(function(d) { d.y = d.depth * 180; });

  // Update the nodes…
  var node = svg.selectAll("g.node")
      .data(nodes, function(d) { return d.id || (d.id = ++i); });

  // Enter any new nodes at the parent's previous position.
  var nodeEnter = node.enter().append("g")
    .attr("class", "node")
    .attr("transform", function(d) { return "translate(" + source.y0 + "," + source.x0 + ")"; });
    //.attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; });

  //colour coded rounded rect 
  nodeEnter.append("path")
    .style("stroke", "black")
    .style("fill-opacity", 0.5)
    .on("click", toggleChildren)
    .attr("d", function(d) {
      return rightRoundedRect(0, -30, 100, 60, 10);
    })
    .style("fill", 
      function(d){ 
        var type = getType(d);
        if(type == "question"){
          return "blue";
        }
        else if(type == "idea"){
          return "yellow";
        }
      });

  nodeEnter.append("text")
    .attr("dy", ".35em")
    .attr("y", "-25")
    .style("fill-opacity", 1)
    .style("font-size", 8)
    .each(function (d) {
      var lines = wordwrap(d.name, 14)
      for (var i = 0; i < lines.length; i++) {
         d3.select(this).append("tspan")
             .attr("dy",8)
             .attr("x",function(d) { 
                  return d.children1 || d._children1 ? - 10 : 20; })
              .text(lines[i])
       }
     });
        
  nodeEnter.append("path")
  .style("stroke", "black")
  .style("transform", "translate(90px, -20px)")
  .style("fill", "yellow") 
  .attr("class", "hastip")
  .attr("title", "Add Idea")
  .on("click", openIdeaCard)
  .attr("d", d3.svg.symbol()
               .type("square")
               .size( function(d){ return 20*20; })
               );

  nodeEnter.append("path")
  .style("stroke", "black")
  .style("fill", "blue")
  .style("transform", "translate(90px, 20px)")
  .attr("class", "hastip")
  .attr("title", "Add Question") 
  .on("click", openQuestionCard)
  .attr("d", d3.svg.symbol()
               .type("square")
               .size( function(d){ return 20*20; })
               ); 

  // Transition nodes to their new position.
  var nodeUpdate = node.transition()
      .duration(duration)
      .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; });

  nodeUpdate.select("path")
      .attr("r", 4.5)

  nodeUpdate.select("text")
      .style("fill-opacity", 1);

  // Transition exiting nodes to the parent's new position.
  var nodeExit = node.exit().transition()
      .duration(duration)
      .attr("transform", function(d) { return "translate(" + source.y + "," + source.x + ")"; })
      .remove();

  nodeExit.select("path")
      .attr("r", 1e-6);

  nodeExit.select("text")
      .style("fill-opacity", 1e-6);

  // Update the links…
  var link = svg.selectAll("path.link")
      .data(links, function(d) { return d.target.id; });

  // Enter any new links at the parent's previous position.
  link.enter().insert("path", "g")
      .attr("class", "link")
      .attr("d", function(d) {
        var o = {x: source.x0, y: source.y0};
        return diagonal({source: o, target: o});
      });

  // Transition links to their new position.
  link.transition()
      .duration(duration)
      .attr("d", diagonal);

  // Transition exiting nodes to the parent's new position.
  link.exit().transition()
      .duration(duration)
      .attr("d", function(d) {
        var o = {x: source.x, y: source.y};
        return diagonal({source: o, target: o});
      })
      .remove();



  // Stash the old positions for transition.
  nodes.forEach(function(d) {
    d.x0 = d.x;
    d.y0 = d.y;
  });


  //add argument button to idea nodes only
  var node = svg.selectAll(".node")
  .append("path")
  .filter(function (d) {
          return d.type == "idea"
    })
  .style("stroke", "black")
  .style("fill", "orange")
  .style("transform", "translate(90px, 0px)")
  .attr("class", "hastip")
  .attr("title", "View/Add Arguments")
  .on("click", openArgumentFieldCard)
  .attr("d", d3.svg.symbol()
               .type("square")
               .size( function(d){ return 20*20; })
               );

  height = $('#svgContainer').height() + 20;
  width = $('#svgContainer').width();
  $('.hastip').tooltipsy();
}

// Toggle children on click.
function toggleChildren(d) {
  if (d.children) {
    d._children = d.children;
    d.children = null;
  } else {
    d.children = d._children;
    d._children = null;
  }
  update(d);
}

function appendChild(d, text, type) {
  addChildNode(DATA.elements, d.id, text, type);
  update(d);
}

function addChildNode(o, parentId, text, type) {
  var newChild = new Object();
  newChild.name = text;
  newChild.id = maxId++;
  newChild.type = type;
  newChild.children = [];

  if(o != undefined && o.constructor === Array){
    o.forEach(function(entry){
      if(entry.hasOwnProperty("id")){
        if(entry.id == parentId){
          if(entry.children != undefined){
            entry.children.push(newChild);
          }
          else {
            entry.children = [newChild];
          }
        }
        else if (entry.children !== []) {
          addChildNode(entry.children, parentId, text, type);
        }
      }
    });
  }
}

function getType(d){
  var type = getTypeOfNode(DATA.elements, d.id);
  return type;
}

function getTypeOfNode(o, parentId){
  var found = false;
  var trail = [];

  function recurse(arr, id){
    //for(entry in o){
    var entry;
    for(var i = 0; i < arr.length; i++){
      entry = arr[i];
      trail.push(entry.type);

      if(entry.id === parentId){
        found = true;
        break;
      }
      else {
        if(entry.children !== undefined) {
          recurse(entry.children);
          if(found){
            break;
          }
        }
      }
    }
  }
  recurse(o, parentId);

  return trail.pop();
}

function addArg(o, parentId, arg){
  var found = false;
  var trail = [];

  function recurse(arr, id){
    //for(entry in o){
    var entry;
    for(var i = 0; i < arr.length; i++){
      entry = arr[i];
      trail.push(entry.type);

      if(entry.id === parentId){
        if(entry.arguments !== undefined){
          entry.arguments.push(arg);
          found = true;
          break;
        }
        else{
          entry.arguments = [arg];
        }      
      }
      else {
        if(entry.children !== undefined) {
          recurse(entry.children);
          if(found){
            break;
          }
        }
      }
    }
  }
  recurse(o, parentId);
}

function setCurrArgNode(d){
  currArgNode = d;
  $('#argHeader').append("h5").attr("class", "ui header").text("\"" + currArgNode.name + "\"");
}

function argPlus(){
  if(currArgNode.size >= 90){

  }
  else {
    increaseArg(DATA.elements, currNode.id, currArgNode, 10);
    //makeArgumentsCard(currNode);  
  }
  force.start();
}

function argMinus(){
  if(currArgNode.size <= 10){

  }
  else {
    increaseArg(DATA.elements, currNode.id, currArgNode, -10);
    //makeArgumentsCard(currNode);
  }
  force.start();
}

function increaseArg(o, parentId, arg, change){
  var found = false;

  function recurse(arr, id){
    //for(entry in o){
    var entry;
    for(var i = 0; i < arr.length; i++){
      entry = arr[i];

      if(entry.id === parentId){
        var args = entry.arguments;
        if(args !== undefined){
          for(var j = 0; j < args.length; j++){
            if(args[j].id == arg.id){
              args[j].size = args[j].size + change;
              found = true;
              break;
            }

          }
        }
      }
      else {
        if(entry.children !== undefined) {
          recurse(entry.children);
          if(found){
            break;
          }
        }
      }
    }
  }
  recurse(o, parentId);
}

//http://stackoverflow.com/questions/12115691/svg-d3-js-rounded-corner-on-one-corner-of-a-rectangle
function rightRoundedRect(x, y, width, height, radius) {
  return "M" + x + "," + y
       + "h" + (width - radius)
       + "a" + radius + "," + radius + " 0 0 1 " + radius + "," + radius
       + "v" + (height - 2 * radius)
       + "a" + radius + "," + radius + " 0 0 1 " + -radius + "," + radius
       + "h" + (radius - width)
       + "z";
}

function wordwrap(text, max) {
  var regex = new RegExp(".{0,"+max+"}(?:\\s|$)","g");
  var lines = [];
  var line; 
  while ((line = regex.exec(text))!="") {lines.push(line);} 
  return lines;
}   

//TODO: clear any existing arg fields
function openArgumentFieldCard(d){
  if(d !== undefined){
    currNode = d;
  }
  if (ideaCard.hasClass("visible")) closeIdeaCard();
  if (argumentCard.hasClass("visible")) closeArgumentCard();
  if (questionCard.hasClass("visible")) closeQuestionCard();
  argumentFieldCard.transition('scale in');
  makeArgumentsCard(currNode);
}

function closeArgumentFieldCard(){
  argumentFieldCard.transition('scale out');
  if (ideaCard.hasClass("visible")) closeI();
  if (argumentCard.hasClass("visible")) closeArgumentCard();
  if (questionCard.hasClass("visible")) closeQuestionCard();
  $('#argumentFieldHeader').text('');
  $('#argHeader').text('Select an argument');
  $('#argumentField').empty();;
}

function openIdeaCard(d){
  currNode = d;
  if (argumentFieldCard.hasClass("visible")) closeArgumentFieldCard();
  if (argumentCard.hasClass("visible")) closeArgumentCard();
  if (questionCard.hasClass("visible")) closeQuestionCard();
  
  $('#ideaParentTitle').text(currNode.name);
  ideaCard.css('position', 'absolute');
  ideaCard.css('left', d.x);
  ideaCard.css('top', d.y); 
  ideaCard.transition('scale in');
}

function closeIdeaCard(){
  if(ideaCard.hasClass("visible")){
    ideaCard.transition('scale out');
  }
  $('#userIdeaField').val('');
}

function openQuestionCard(d){
  currNode = d;
  if (argumentFieldCard.hasClass("visible")) closeArgumentFieldCard();
  if (argumentCard.hasClass("visible")) closeArgumentCard();
  if (ideaCard.hasClass("visible")) closeIdeaCard();
  $('#qParentTitle').text(currNode.name)
  questionCard.css('position', 'absolute');
  questionCard.css('left', d.x);
  questionCard.css('top', d.y/2); 
  questionCard.transition('scale in');
}

function closeQuestionCard(){
  if(questionCard.hasClass("visible")){
    questionCard.transition('scale out');
  }
  $('#userQuestionField').val('');
}

function openArgumentCard(d){
  if (argumentFieldCard.hasClass("visible")) closeArgumentFieldCard();
  if (questionCard.hasClass("visible")) closeQuestionCard();
  if (ideaCard.hasClass("visible")) closeIdeaCard();
  $('#argParentName').text(currNode.name);
  argumentCard.css('position', 'absolute');
  argumentCard.css('left', currNode.x);
  argumentCard.css('top', currNode.y/2); 
  argumentCard.transition('scale in');
}

function closeArgumentCard(){
  if(argumentCard.hasClass("visible")){
    argumentCard.transition('scale out');
    resetArrows();
    $('#userArgText').val('');
  }
}

function saveIdeaForm() {
  appendChild(currNode, $('#userIdeaField').val(), "idea");
  closeIdeaCard();
}

function saveQuestionForm() {
  appendChild(currNode, $('#userQuestionField').val(), "question");
  closeQuestionCard();
}

function saveArgumentForm() {
  if(argumentValence !== null){
    var arg = new Object();
    arg.valence = argumentValence;
    arg.name = $('#userArgText').val();
    arg.id = maxId++;
    arg.size = 50;

    addArg(DATA.elements, currNode.id, arg);
    closeArgumentCard();
    makeArgumentsCard(currNode);
    openArgumentFieldCard();
  }
}

function upArrowClicked(){
  $('#upArrow').className += "green";
}

function resetArrows(){
  argumentValence = null;
  $('#downArrow').removeClass('red').addClass('black');
  $('#upArrow').removeClass('green').addClass('black');
}

function saveJSON(){
  console.log(JSON.stringify(DATA.elements, function(key,value){
    if(key == "parent" || key == "x" || key == "y" || key == "x0" || key == "y0" || key == "depth" || key == "px" || key == "py" || key == "fixed"){
      return undefined;
    }
      return value;
    }));
}

$('#upArrow').on('click', function() {
  $('#upArrow').removeClass('black').addClass('green');
  $('#downArrow').removeClass('red').addClass('black');
  argumentValence = "for";
});

$('#downArrow').on('click', function() {
  $('#downArrow').removeClass('black').addClass('red');
  $('#upArrow').removeClass('green').addClass('black');
  argumentValence = "against";
});

$("#saveArgument")
  .popup({
    on: 'click',
    position : 'left',
    inline: true
});