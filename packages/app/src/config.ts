import { LayoutConf } from "./App";

const conf: LayoutConf = {
  // what channels should be initially selected
  initialSelection: [0, 1],
  // mapping of sizes to presets
  // list of presets are cycled through in the specified order,
  // first element in the list serves as the default
  // possible sizes are: grande (8x8), tall (4x8) and short (4x4)
  // grid is indexed horizontally left-to-right then vertically bottom-to-top
  // check for available controls and their parameters in the controls directory
  presets: {
    grande: [
      {
        // 'Grande'
        grid: [
          { pos: [0, 0], control: { type: 'play' } },
          { pos: [1, 0], control: { type: 'sync' } },
          { pos: [2, 0], control: { type: 'nudge' } },
          { pos: [0, 1], control: { type: 'cue' } },
          { pos: [1, 1], control: { type: 'tap' } },
          { pos: [2, 1], control: { type: 'grid' } },
          { pos: [0, 2], control: { type: 'pfl' } },
          { pos: [1, 2], control: { type: 'quantize' } },
          {
            pos: [2, 2],
            control: {
              type: 'keyshift',
              params: {
                // should fail 
                shifts: [
                  [1, 1],
                  [2, 2],
                  [3, 3],
                  [5, 4],
                  [7, 5],
                  [8, 6],
                  [10, 7],
                  [12, 8],
                ],
                rows: 2,
              },
            },
          },
          { pos: [0, 3], control: { type: 'load' } },
          { pos: [1, 3], control: { type: 'key' } },
          { pos: [0, 4], control: { type: 'hotcue', params: {cues: 8, rows:2} } },
          {
            pos: [2, 6],
            control: {
              type: 'beatjump',
              params: {
                jumps: [
                  [0.25, 1],
                  [0.33, 2],
                  [0.5, 4],
                  [0.75, 8],
                  [1, 16],
                  [2, 32],
                ]
              },
            },
          },
          {
            pos: [4, 2],
            control: {
              type: 'beatloop',
              params: {loops: [0.5, 1, 2, 4, 8, 16, 32, 64], rows: 2},
            },
          },
          {
            pos: [6, 2],
            control: {
              type: 'loopjump',
              params: {
                jumps: [
                  [0.5, 8],
                  [1, 16],
                  [2, 32],
                  [4, 64],
                ],
                vertical: true
              },
            },
          },
          {
            pos: [6, 1],
            control: { type: 'loopjumpSmall', params: { amount: 0.03125 } },
          },
          { pos: [4, 1], control: { type: 'loopMultiply' } },
          { pos: [4, 0], control: { type: 'reloop' } },
          { pos: [5, 0], control: { type: 'loopIo' } },
          { pos: [7, 0], control: { type: 'slip' } },
        ],
      },
    ],
    tall: [
      {
        // 'Tall'
        grid: [
          { pos: [0, 0], control: { type: 'play' } },
          { pos: [1, 0], control: { type: 'sync' } },
          { pos: [2, 0], control: { type: 'nudge' } },
          { pos: [0, 1], control: { type: 'cue' } },
          { pos: [1, 1], control: { type: 'tap' } },
          { pos: [2, 1], control: { type: 'grid' } },
          { pos: [0, 2], control: { type: 'pfl' } },
          { pos: [1, 2], control: { type: 'quantize' } },
          { pos: [2, 2], control: { type: 'loopIo' } },
          { pos: [0, 3], control: { type: 'load' } },
          { pos: [1, 3], control: { type: 'key' } },
          { pos: [2, 3], control: { type: 'reloop' } },
          { pos: [3, 3], control: { type: 'slip' } },
          { pos: [0, 4], control: { type: 'hotcue', params: { cues: 4, rows:2 } } }, //hotcue: hotcue(4, 2)([0, 4]),
          { pos: [2, 4], control: { type: 'loopMultiply' } }, //loopMultiply: loopMultiply([2, 4]),
          {
            pos: [2, 5],
            control: { type: 'beatloop', params: { loops: [0.5, 1, 2, 4, 8, 16], rows: 2} },
          },
          {
            pos: [0, 6],
            control: {
              type: 'beatjump',
              params: {
                jumps: [
                  [1, 16],
                  [2, 32],
                ],
              
              },
            },
          },
        ],
      },
      {
        // 'Juggler'
        grid: [
          { pos: [0, 0], control: { type: 'play' } },
          { pos: [1, 0], control: { type: 'load' } },
          {
            pos: [2, 0],
            control: {
              type: 'beatjump',
              params: {
                jumps: [
                  [0.5, 4],
                  [1, 16],
                  [2, 32],
                  [4, 64],
                ],
                vertical: true,
              },
            },
          },
          {
            pos: [0, 1],
            control: {
              type: 'loopjump',
              params: {
                jumps: [
                  [1, 16],
                  [4, 64],
                ],
              },
            },
          },
          { pos: [0, 3], control: { type: 'reloop' } },
          { pos: [0, 4], control: { type: 'loopMultiply' } },
          { pos: [2, 4], control: { type: 'hotcue', params: {cues: 8, rows: 2} } },
          {
            pos: [0, 5],
            control: { type: 'beatloop', params: { loops: [0.5, 1, 2, 4, 8, 16], rows: 2} },
          },
        ],
      },
    ],
    short: [
      {
        // 'Short'
        grid: [
          { pos: [0, 0], control: { type: 'play' } },
          { pos: [1, 0], control: { type: 'sync' } },
          { pos: [2, 0], control: { type: 'nudge' } },
          { pos: [0, 1], control: { type: 'cue' } },
          { pos: [1, 1], control: { type: 'tap' } },
          { pos: [2, 1], control: { type: 'grid' } },
          { pos: [0, 2], control: { type: 'pfl' } },
          { pos: [1, 2], control: { type: 'quantize' } },
          { pos: [2, 2], control: { type: 'loopIo' } },
          { pos: [0, 3], control: { type: 'load' } },
          { pos: [1, 3], control: { type: 'key' } },
          { pos: [2, 3], control: { type: 'reloop' } },
          { pos: [3, 3], control: { type: 'slip' } },
        ],
      },
      {
        // 'Sampler'
        grid: [
          { pos: [0, 0], control: { type: 'hotcue', params: { cues: 16, rows: 4} } },
        ],
      },
    ],
  },
};

export default conf;
