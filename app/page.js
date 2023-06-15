import React from 'react'


var input = require('./input.json')[0]
export default function Home() {
  // console.log(typeof(input))
  // console.log(input)
  var out = parseJson(input, 0)
  console.log(typeof(out))
  return (
          <div>
            {out}
          </div>
      )
}

function parseMention(mention) {
  return mention.children[0].text
}

function parseList(list) {
  var output = []
  let i = 0
  for (var child of list.children) {
    // console.log(child)
    for (var li of child.children) {
      var curr = []
      for (var lic of li.children) {
        if (lic.type == 'mention') {
          curr.push(parseMention(lic))
        } else {
          curr.push(lic.text)
        }
      }
      console.log(curr)
    }

    output.push(React.createElement("li", {key:i++}, curr))
  }

  return React.createElement("ul", null, output)

}

var textTags = new Set(["h1", "h2", "h3", "h4", "h5", "h6", "p"]);
function parseClause(clause, clauseCount) {
  var output = []
  // console.log(clause)
  var titleObj = clause.children[0]
  var titleProps = titleObj.children[0]

  if ("bold" in titleProps && titleProps.bold) {
    output.push(React.createElement(titleObj.type, null,
                React.createElement('strong', null, clauseCount + ". " + titleProps.text)
          ))
  } else {
    output.push(React.createElement(titleObj.type, null, titleProps.text))
  }
  for (var child of clause.children.splice(1)) {
    // console.log(child)
    if (child.type == "ul") {
      // console.log(child)
      output.push(parseList(child))
    } else if (textTags.has(child.type)) {
      output.push(parseText(child))
    }
  }

  return React.createElement('div', null, output)

}

function parseText(txt, typeTag) {
  if (!("children" in txt)) {
    if ("bold" in txt && txt.bold) {
      return React.createElement(typeTag, null, React.createElement("strong", {}, txt.text))
    }
    return React.createElement(typeTag, null, txt.text)
    
  }
  var output = []
  for (var child of txt.children) {
    if ("type" in child && child.type == "mention") {
      output.push(parseMention(child))
    } else {
      if ("text" in child && child.text.includes("\n")) {
        let toks = child.text.split("\n")
        output.push(toks[0])
        output.push(React.createElement('br', null, null))
        // output.push(toks[1])
      }
      if ("bold" in child && child.bold) {
        output.push(React.createElement("b", null, child.text))
      } else {
        output.push(child.text)
      }
    }
  }
  return React.createElement("div", null, output)
}

function parseJson(inpt, clauseCount) {
  var output = []
  if ("children" in inpt) {
    for (var child of inpt["children"]) {
      // console.log(child.type)
      if (textTags.has(child.type)) {
        output.push(parseText(child, child.type))
      } else if (child.type == 'mention') {
        output.push(parseMention(child))
      } else if (child.type == 'clause') {
        output.push(parseClause(child, ++clauseCount))
      } else {
        output.push(parseJson(child))
      }
    }
  }
  return output
}

