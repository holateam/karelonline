var userCode = "package com.shpp.alyabihova.cs;\nimport com.shpp.karel.KarelTheRobot;\n/**\n * Karel Finds the middle of the south line, on which he stands.\n * Preconditions: Karel stands in the south-west corner and looks to the East.\n *                The World is empty. World's length >= its width.\n * Postconditions: The middle of the south line is marked by one beeper.\n *                 If the length of the south line is equal to even number -\n *                 line is marked by beepers in one of the two middle cells. *\n */\n\npublic class Assignment1Part3 extends KarelTheRobot {\n\n    public void run() throws Exception {\n    measureOutTheMiddle();\n}\n/*\n * check if the length of the south line equal 1 and if it is not then\n * measures the middle by shifting beepers every time one step closer.\n * Precondition: Karel stands in the south-west corner and looks to the East.\n * Postcondition: middle of the south line is marked by beeper.\n */\nprivate void measureOutTheMiddle() throws Exception{\n    if (frontIsBlocked()){\n        putBeeper();\n    } else {\n        pointEdges();\n        findTheMiddle();\n    }\n}\n// marks edges of the south line by beepers\nprivate void pointEdges() throws Exception {\n    putBeeper();\n    while(frontIsClear()) {\n        move();\n    }\n    putBeeper();\n    /*\n     * turns Karel to the opposite direction and leaves a beeper behind.\n     * Preconditions: Karel stands at the eastern edge with facing to the East.\n     * Postcondition: Karel stands in one step away from the eastern edge\n     * with looking to the West. Karel leaves a beeper behind his back.\n     */\n    turnAround();\n    move();\n}\n/*\n * measures the middle of the line by shifting beepers\n * and pick one of the central beepers if the length of the line is even.\n */\nprivate void findTheMiddle() throws Exception {\n    while (noBeepersPresent()) {\n        measureByBeeper();\n    }\n    if (beepersPresent()) {\n        pickBeeper();\n    }\n}\n// shifting side beepers each time a step closer\nprivate void measureByBeeper() throws Exception {\n    while (noBeepersPresent()) {\n        move();\n    }\n\n    // turns Karel to the opposite direction.\n    turnAround();\n    shiftingOneBeeperOneCellInTheDirectionOfMotion();\n    // moves Karel to leave beeper behind his back\n    move();\n}\n\n\nprivate void shiftingOneBeeperOneCellInTheDirectionOfMotion() throws Exception {\n    pickBeeper();\n    move();\n    putBeeper();\n}\n\n\nprivate void turnAround() throws Exception {\n   turnLeft();\n    turnLeft();\n}\n}\n";
var maps = {
    original: {
        map: [
            ['',   'x',   '',  '',  '',  '', '',  '',   '',  '',  '',  ''],
            ['',   '',   '',  '',  '',  '', '',  '',   '',  '',  '',  ''],
            ['',   '',   '',  '',  '',  '', '',  '',   '',  '',  '',  '']

        ],
        karel: {
            position: [0, 2],
            direction: 1,
            beepers: 1000
        }

    },
    final: [
        {
            map: [
                ['',   '',   '',  '',  '',  '', '',  '',   '',  '',  '',  ''],
                ['',   '',   '',  '',  '',  '', '',  '',   '',  '',  '',  ''],
                ['',   '',   '',  '',  '',  1, '',  '',   '',  '',  '',  '']
                ],
            karel: {
                position: [0, 2],
                direction: 1
                }
        },
        {
            map: [
                ['', '', '', '', '', '', '', '', '', '', '', ''],
                ['', '', '', '', '', '', '', '', '', '', '', ''],
                ['', '', '', '', '', '', 1, '', '', '', '', '']
            ],
            karel: {
                position: [0, 2],
                direction: 1
            }
        }
    ]
};
var lang = "java";
console.log(KarelCodeCompiler.compile(userCode, maps, lang));