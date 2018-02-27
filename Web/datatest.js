var DATA = {
 "elements": [
    {
      "name": "CIA Leaks",
      "id": 1,
      "type": "question",
      "children": [
        {
          "id": 2,
          "name": "What are the leaks?",
          "type": "question",
          "children": [
            {"id": 3, 
            "name": "Dump of internal documents",
            "type": "idea",
            "children": []
            }
          ]
        },
        {
          "id": 4,
          "name": "How important are they?",
          "type": "question",
          "children": [
            {"id": 5,
              "name": "Very important",
              "type": "idea",
              "children": [],
              "arguments": [
              {"valence": "for",
               "name": "The CIA had unchecked power",
               "size": 50,
               "id": 14},
              {"valence": "against",
               "name": "Intelligence agencies should be able to do whatever they need",
               "size": 50,
               "id": 15}
              ]}
          ]
        },
        {
          "id": 16,
          "name": "Who leaked the data?",
          "type": "question",
          "children": [
            {
              "id": 17,
              "name": "WikiLeaks",
              "type": "idea",
              "arguments": [
              {
                "valence": "for",
                "name": "[LINK]",
                "size": 50,
                "id": 18,
              }
              ],
              "children": []}
          ]
        }
      ]
    } 
  ]
};
var maxId = 19;