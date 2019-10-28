const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const Cast = require('../../util/cast');
const Clone = require('../../util/clone');
const Color = require('../../util/color');
const formatMessage = require('format-message');
const MathUtil = require('../../util/math-util');
//const RenderedTarget = require('../../sprites/rendered-target');
const log = require('../../util/log');
const StageLayering = require('../../engine/stage-layering');



/**
 * Icon svg to be displayed at the left edge of each extension block, encoded as a data URI.
 * @type {string}
 */
// eslint-disable-next-line max-len
const blockIconURI = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48dGl0bGU+cGVuLWljb248L3RpdGxlPjxnIHN0cm9rZT0iIzU3NUU3NSIgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxwYXRoIGQ9Ik04Ljc1MyAzNC42MDJsLTQuMjUgMS43OCAxLjc4My00LjIzN2MxLjIxOC0yLjg5MiAyLjkwNy01LjQyMyA1LjAzLTcuNTM4TDMxLjA2NiA0LjkzYy44NDYtLjg0MiAyLjY1LS40MSA0LjAzMi45NjcgMS4zOCAxLjM3NSAxLjgxNiAzLjE3My45NyA0LjAxNUwxNi4zMTggMjkuNTljLTIuMTIzIDIuMTE2LTQuNjY0IDMuOC03LjU2NSA1LjAxMiIgZmlsbD0iI0ZGRiIvPjxwYXRoIGQ9Ik0yOS40MSA2LjExcy00LjQ1LTIuMzc4LTguMjAyIDUuNzcyYy0xLjczNCAzLjc2Ni00LjM1IDEuNTQ2LTQuMzUgMS41NDYiLz48cGF0aCBkPSJNMzYuNDIgOC44MjVjMCAuNDYzLS4xNC44NzMtLjQzMiAxLjE2NGwtOS4zMzUgOS4zYy4yODItLjI5LjQxLS42NjguNDEtMS4xMiAwLS44NzQtLjUwNy0xLjk2My0xLjQwNi0yLjg2OC0xLjM2Mi0xLjM1OC0zLjE0Ny0xLjgtNC4wMDItLjk5TDMwLjk5IDUuMDFjLjg0NC0uODQgMi42NS0uNDEgNC4wMzUuOTYuODk4LjkwNCAxLjM5NiAxLjk4MiAxLjM5NiAyLjg1NU0xMC41MTUgMzMuNzc0Yy0uNTczLjMwMi0xLjE1Ny41Ny0xLjc2NC44M0w0LjUgMzYuMzgybDEuNzg2LTQuMjM1Yy4yNTgtLjYwNC41My0xLjE4Ni44MzMtMS43NTcuNjkuMTgzIDEuNDQ4LjYyNSAyLjEwOCAxLjI4Mi42Ni42NTggMS4xMDIgMS40MTIgMS4yODcgMi4xMDIiIGZpbGw9IiM0Qzk3RkYiLz48cGF0aCBkPSJNMzYuNDk4IDguNzQ4YzAgLjQ2NC0uMTQuODc0LS40MzMgMS4xNjVsLTE5Ljc0MiAxOS42OGMtMi4xMyAyLjExLTQuNjczIDMuNzkzLTcuNTcyIDUuMDFMNC41IDM2LjM4bC45NzQtMi4zMTYgMS45MjUtLjgwOGMyLjg5OC0xLjIxOCA1LjQ0LTIuOSA3LjU3LTUuMDFsMTkuNzQzLTE5LjY4Yy4yOTItLjI5Mi40MzItLjcwMi40MzItMS4xNjUgMC0uNjQ2LS4yNy0xLjQtLjc4LTIuMTIyLjI1LjE3Mi41LjM3Ny43MzcuNjE0Ljg5OC45MDUgMS4zOTYgMS45ODMgMS4zOTYgMi44NTYiIGZpbGw9IiM1NzVFNzUiIG9wYWNpdHk9Ii4xNSIvPjxwYXRoIGQ9Ik0xOC40NSAxMi44M2MwIC41LS40MDQuOTA1LS45MDQuOTA1cy0uOTA1LS40MDUtLjkwNS0uOTA0YzAtLjUuNDA3LS45MDMuOTA2LS45MDMuNSAwIC45MDQuNDA0LjkwNC45MDR6IiBmaWxsPSIjNTc1RTc1Ii8+PC9nPjwvc3ZnPg==';


/**
 * Host for the Pen-related blocks in Scratch 3.0
 * @param {Runtime} runtime - the runtime instantiating this block package.
 * @constructor
 */
class ScratchCraft {
	

    constructor (runtime) {
        /**
         * The runtime instantiating this block package.
         * @type {Runtime}
         */
        this.runtime = runtime;
		this.scratchCraftAddress = 'http://127.0.0.1:8088'; 
		
		// Starts reading 'poll' data from scratchCraft server.
		//this.pollIntervalId = window.setInterval(this.getPollFromServer, 500);
		 this.pollIntervalId = setInterval(
			 (function(self) {         //Self-executing func which takes 'this' as self
				 return function() {   //Return a function in the context of 'self'
					 self.getPollFromServer(); //Thing you wanted to run as non-window 'this'
				 }
			 })(this),
			 500     //normal interval, 'this' scope not impacted here.
		 );
		 
		
		this.pollValue = "";
		this.blockType = "";
		this.blockData = "";
		this.userName = "";
		this.event = "";
		this.eventAction = "";
		this.eventItemInHand = "";
		this.eventHand = "";
		this.eventMaterial = "";
		this.eventBlockFace = "";
		this.dronePositionX = "";
		this.dronePositionY = "";
		this.dronePositionZ = "";
		this.playerPositionX = "";
		this.playerPositionY = "";
		this.playerPositionZ = "";
		this.result = "";



	// response.write("blockType " + bltype + "\nblockData " +  bldata);
	// response.write("\nevent " + event);		//pgryko
	// response.write("\nevent_action " + event_action);		//pgryko
	// response.write("\nevent_itemInHand " + event_itemInHand);	//pgryko
	// response.write("\nevent_hand " + event_hand);	//pgryko	
	// response.write("\nevent_material " + event_material);	//pgryko	
	// response.write("\nevent_blockFace " + event_blockFace);	//pgryko	
	// response.write("\nposition/x/drone " + drone.x + "\nposition/y/drone " + drone.y + "\nposition/z/drone " + drone.z);
	// response.write("\nposition/x/player " +  player.x + "\nposition/y/player " + player.y + "\nposition/z/player " + player.z);
	// response.write("\nresult " + result);

    }


    /**
     * @returns {object} metadata for this extension and its blocks.
     */
    getInfo () {
        return {
            id: 'scratchCraft',
            name: formatMessage({
                id: 'scratchCraft.categoryName',
                default: 'ScratchCraft',
                description: 'Label for the ScratchCraft extension category'
            }),
            blockIconURI: blockIconURI,
            blocks: [
			
				{
                    opcode: 'getPollValue',
                    text: formatMessage({
                        id: 'scratchCraft.getPollValue',
                        default: 'poll value',
                        description: 'poll value'
                    }),
                    blockType: BlockType.REPORTER
                },  

				{
                    opcode: 'getBlockType',
                    text: formatMessage({
                        id: 'scratchCraft.getBlockType',
                        default: 'block type',
                        description: 'block type'
                    }),
                    blockType: BlockType.REPORTER
                }, 

				{
                    opcode: 'getBlockData',
                    text: formatMessage({
                        id: 'scratchCraft.getBlockData',
                        default: 'block data',
                        description: 'block data'
                    }),
                    blockType: BlockType.REPORTER
                }, 
				
				{
                    opcode: 'getEvent',
                    text: formatMessage({
                        id: 'scratchCraft.getEvent',
                        default: 'event',
                        description: 'event'
                    }),
                    blockType: BlockType.REPORTER
                }, 
				
				{
                    opcode: 'getEventAction',
                    text: formatMessage({
                        id: 'scratchCraft.getEventAction',
                        default: 'event action',
                        description: 'event action'
                    }),
                    blockType: BlockType.REPORTER
                }, 				
				
				{
                    opcode: 'getItemInHand',
                    text: formatMessage({
                        id: 'scratchCraft.getItemInHand',
                        default: 'item in hand',
                        description: 'item in hand'
                    }),
                    blockType: BlockType.REPORTER
                },				
				
				{
                    opcode: 'getCoordinate',
                    text: formatMessage({
                        id: 'scratchCraft.getCoordinate',
                        default: '[COORDINATE] position of [TARGET]',
                        description: 'coordinate'
                    }),
                    blockType: BlockType.REPORTER,
                    arguments: {
                        COORDINATE: {
                            type: ArgumentType.STRING,
							menu: 'COORDINATES',
                            defaultValue: 'x'							
                        },
                        TARGET: {
                            type: ArgumentType.STRING,
							menu: 'TARGETS',
                            defaultValue: 'player'
                        }						
                    }					
                },		

				{
                    opcode: 'getResult',
                    text: formatMessage({
                        id: 'scratchCraft.getResult',
                        default: 'result',
                        description: 'result'
                    }),
                    blockType: BlockType.REPORTER
                },  
				
				
				{
                    opcode: 'connectPlayer',
                    text: formatMessage({
                        id: 'scratchCraft.connectPlayer',
                        default: 'connect [USER_ID]',
                        description: 'connect user to Minecraft'
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        USER_ID: {
                            type: ArgumentType.STRING
                        }
                    }
                },

				{
                    opcode: 'resetConnection',
                    text: formatMessage({
                        id: 'scratchCraft.resetConnection',
                        default: 'reset connection',
                        description: "reset current user's connection to Minecraft"
                    }),
                    blockType: BlockType.COMMAND,
                },

				{
                    opcode: 'buildShape',
                    text: formatMessage({
                        id: 'scratchCraft.buildShape',
                        default: 'build [SHAPE] blockType [BLOCK_TYPE] blockData [BLOCK_DATA] dimensions: [BLOCK_X] [BLOCK_Y] [BLOCK_Z]',
                        description: 'build a shape'
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        SHAPE: {
                            type: ArgumentType.STRING,
							menu: 'SHAPES',
                            defaultValue: 'box'
                        },
                        BLOCK_TYPE: {
                            type: ArgumentType.NUMBER,
                            defaultValue: '1'
                        },						
                        BLOCK_DATA: {
                            type: ArgumentType.NUMBER,
                            defaultValue: '0'
                        },		
                        BLOCK_X: {
                            type: ArgumentType.NUMBER,
                            defaultValue: '1'
                        },	
                        BLOCK_Y: {
                            type: ArgumentType.NUMBER,
                            defaultValue: '1'
                        },	
                        BLOCK_Z: {
                            type: ArgumentType.NUMBER,
                            defaultValue: '1'
                        }							
                    }
                },

				{
                    opcode: 'place',
                    text: formatMessage({
                        id: 'scratchCraft.place',
                        default: 'place [OBJECT] [PAR_1] [PAR_1] [PAR_2] [PAR_3] [PAR_4]',
                        description: 'place object in Minecraft'
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        OBJECT: {
                            type: ArgumentType.STRING,
							menu: 'OBJECTS',
                            defaultValue: 'wallsign'
                        },
                        PAR_1: {
                            type: ArgumentType.STRING,
                            defaultValue: ' '
                        },	
                        PAR_2: {
                            type: ArgumentType.STRING,
                            defaultValue: ' '
                        },	
                        PAR_3: {
                            type: ArgumentType.STRING,
                            defaultValue: ' '
                        },	
						PAR_4: {
                            type: ArgumentType.STRING,
                            defaultValue: ' '
                        }
                    }
                },


				{
                    opcode: 'rainbow',
                    text: formatMessage({
                        id: 'scratchCraft.rainbow',
                        default: 'rainbow radius [RADIUS]',
                        description: 'Rainbow radius'
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        RADIUS: {
                            type: ArgumentType.NUMBER,
							defaultValue: '12'
                        }
                    }
                },
				
				{
                    opcode: 'moveDrone',
                    text: formatMessage({
                        id: 'scratchCraft.moveDrone',
                        default: 'move drone [COMMAND] [COUNT]',
                        description: 'Move drone'
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        COMMAND: {
                            type: ArgumentType.STRING,
							menu: 'COMMANDS',
							defaultValue: 'fwd'
                        },
                        COUNT: {
                            type: ArgumentType.NUMBER,
							defaultValue: '1'
                        }						
                    }
                },				

				{
                    opcode: 'summon',
                    text: formatMessage({
                        id: 'scratchCraft.summon',
                        default: 'summon [ENTITY]',
                        description: 'Summon entity'
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        ENTITY: {
                            type: ArgumentType.STRING,
							menu: 'ENTITIES',
							defaultValue: 'Chicken'
                        }
                    }
                },	
				
				{
                    opcode: 'entitySound',
                    text: formatMessage({
                        id: 'scratchCraft.entitySound',
                        default: 'play entity sound [ENTITY] [ENTITY_SOUND] to player [PLAYER]',
                        description: 'play entity sound'
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        ENTITY: {
                            type: ArgumentType.STRING,
							menu: 'ENTITIES',
							defaultValue: 'Chicken'
                        },
                        ENTITY_SOUND: {
                            type: ArgumentType.STRING,
							menu: 'ENTITY_SOUNDS',
							defaultValue: 'Ambient'
                        },
						PLAYER: {
                            type: ArgumentType.STRING,
							defaultValue: 'all'
                        }
                    }
                },					
				
				{
                    opcode: 'blockSound',
                    text: formatMessage({
                        id: 'scratchCraft.blockSound',
                        default: 'play block sound [BLOCK] [BLOCK_SOUND] to player [PLAYER]',
                        description: 'play block sound'
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        BLOCK: {
                            type: ArgumentType.STRING,
							menu: 'BLOCKS',
							defaultValue: 'Grass'
                        },
                        BLOCK_SOUND: {
                            type: ArgumentType.STRING,
							menu: 'BLOCK_SOUNDS',
							defaultValue: 'Step'
                        },
						PLAYER: {
                            type: ArgumentType.STRING,
							defaultValue: 'all'
                        }
                    }
                },					

				{
                    opcode: 'music',
                    text: formatMessage({
                        id: 'scratchCraft.music',
                        default: 'play music record [RECORD] to player [PLAYER]',
                        description: 'play music record'
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        RECORD: {
                            type: ArgumentType.STRING,
							menu: 'RECORDS',
							defaultValue: '11'
                        },
						PLAYER: {
                            type: ArgumentType.STRING,
							defaultValue: 'all'
                        }
                    }
                },					

				{
                    opcode: 'chickentype',
                    text: formatMessage({
                        id: 'scratchCraft.chickentype',
                        default: 'chickentype ',
                        description: 'chicken type'
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        RECORD: {
                            type: ArgumentType.STRING,
							menu: 'RECORDS',
							defaultValue: '11'
                        },
						PLAYER: {
                            type: ArgumentType.STRING,
							defaultValue: 'all'
                        }
                    }
                },					
				
// *****************************


				{
                    opcode: 'teleport',
                    text: formatMessage({
                        id: 'scratchCraft.teleport',
                        default: 'teleport [PLAYER_NAME] [TELEPORT_TYPE]  x: [TELEPORT_X] y: [TELEPORT_Y] z: [TELEPORT_Z]',
                        description: 'teleport player in Minecraft'
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        PLAYER_NAME: {
                            type: ArgumentType.STRING
                        },
                        TELEPORT_TYPE: {
                            type: ArgumentType.STRING,
							menu: 'TELEPORT_TYPES',
                            defaultValue: 'at'
                        },	

                        TELEPORT_X: {
                            type: ArgumentType.NUMBER,
                            defaultValue: '0'
                        },	
                        TELEPORT_Y: {
                            type: ArgumentType.NUMBER,
                            defaultValue: '0'
                        },	
                        TELEPORT_Z: {
                            type: ArgumentType.NUMBER,
                            defaultValue: '0'
                        }	
                    }
                },

				{
                    opcode: 'turn',
                    text: formatMessage({
                        id: 'scratchCraft.turn',
                        default: 'turn [PLAYER_NAME] [TURN_TYPE] [TURN_X] [TURN_Y] [TURN_Z]',
                        description: 'turn player in Minecraft'
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        PLAYER_NAME: {
                            type: ArgumentType.STRING
                        },
                        TURN_TYPE: {
                            type: ArgumentType.STRING,
							menu: 'TURN_TYPES',
                            defaultValue: 'horizontal_to'
                        },	

                        TURN_X: {
                            type: ArgumentType.NUMBER,
                            defaultValue: '0'
                        },	
                        TURN_Y: {
                            type: ArgumentType.NUMBER,
                            defaultValue: '0'
                        },	
                        TURN_Z: {
                            type: ArgumentType.NUMBER,
                            defaultValue: '0'
                        }	
                    }
                },

				{
                    opcode: 'setTime',
                    text: formatMessage({
                        id: 'scratchCraft.setTime',
                        default: 'set time [TIME_ID]',
                        description: 'set the time'
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        TIME_ID: {
                            type: ArgumentType.STRING,
							menu: 'TIME_ID',
                            defaultValue: 'day'
                        }
                    }
                },				

				{
                    opcode: 'setWeather',
                    text: formatMessage({
                        id: 'scratchCraft.setWeather',
                        default: 'set weather [WEATHER]',
                        description: 'set the weather'
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        WEATHER: {
                            type: ArgumentType.STRING,
							menu: 'WEATHER',
                            defaultValue: 'clear'
                        }
                    }
                },

				{
                    opcode: 'resetEvent',
                    text: formatMessage({
                        id: 'scratchCraft.resetEvent',
                        default: 'reset_event',
                        description: 'reset event'
                    }),
                    blockType: BlockType.COMMAND
                }					

            ],
            menus: {
                TIME_ID: {
                    acceptReporters: true,
                    items: [
                        {
                            text: formatMessage({
                                id: 'scratchCraft.setTime.day',
                                default: 'day',
                                description:
                                    'day in Minecraft'
                            }),
                            value: 'day'
                        },

                        {
                            text: formatMessage({
                                id: 'scratchCraft.setTime.night',
                                default: 'night',
                                description:
                                    'night in Minecraft'
                            }),
                            value: 'night'
                        }

                    ]
                },
				
                TELEPORT_TYPES: {
                    acceptReporters: true,
                    items: [
                        {
                            text: formatMessage({
                                id: 'scratchCraft.teleport.at',
                                default: 'at',
                                description:
                                    'teleport at'
                            }),
                            value: 'at'
                        },

                        {
                            text: formatMessage({
                                id: 'scratchCraft.teleport.offset',
                                default: 'offset',
                                description:
                                    'teleport offset'
                            }),
                            value: 'offset'
                        },

                        {
                            text: formatMessage({
                                id: 'scratchCraft.teleport.to_drone',
                                default: 'to_drone',
                                description:
                                    'teleport to drone'
                            }),
                            value: 'to_drone'
                        }

                    ]
                },				
				
                TURN_TYPES: {
                    acceptReporters: true,
                    items: [
                        {
                            text: formatMessage({
                                id: 'scratchCraft.turn.horizontal_to',
                                default: 'horizontal_to',
                                description:
                                    'horizontal to'
                            }),
                            value: 'horizontal_to'
                        },
                        {
                            text: formatMessage({
                                id: 'scratchCraft.turn.horizontal_by',
                                default: 'horizontal_by',
                                description:
                                    'horizontal by'
                            }),
                            value: 'horizontal_by'
                        },
                        {
                            text: formatMessage({
                                id: 'scratchCraft.turn.vertical_to',
                                default: 'vertical_to',
                                description:
                                    'vertical to'
                            }),
                            value: 'vertical_to'
                        },
                        {
                            text: formatMessage({
                                id: 'scratchCraft.turn.vertical_by',
                                default: 'vertical_by',
                                description:
                                    'vertical by'
                            }),
                            value: 'vertical_by'
                        },
                        {
                            text: formatMessage({
                                id: 'scratchCraft.turn.to_point',
                                default: 'to_point',
                                description:
                                    'to point'
                            }),
                            value: 'to_point'
                        },		
                        {
                            text: formatMessage({
                                id: 'scratchCraft.turn.to_drone',
                                default: 'to_drone',
                                description:
                                    'to drone'
                            }),
                            value: 'to_drone'
                        }							
						
                    ]
                },
				
				
                SHAPES: {
                    acceptReporters: true,
                    items: [
                        {
                            text: formatMessage({
                                id: 'scratchCraft.buildShape.box',
                                default: 'box',
                                description: 'box in Minecraft'
                            }),
                            value: 'box'
                        },

                        {
                            text: formatMessage({
                                id: 'scratchCraft.buildShape.box0',
								default: 'box0',
                                description: 'box0 in Minecraft'
                            }),
                            value: 'box0'
                        },
 
                        {
                            text: formatMessage({
                                id: 'scratchCraft.buildShape.cylinder',
								default: 'cylinder',
                                description: 'cylinder in Minecraft'
                            }),
                            value: 'cylinder'
                        },
 
                        {
                            text: formatMessage({
                                id: 'scratchCraft.buildShape.cylinder0',
								default: 'cylinder0',
                                description: 'cylinder0 in Minecraft'
                            }),
                            value: 'cylinder0'
                        },

                        {
                            text: formatMessage({
                                id: 'scratchCraft.buildShape.prism',
								default: 'prism',
                                description: 'prism in Minecraft'
                            }),
                            value: 'prism'
                        },

                        {
                            text: formatMessage({
                                id: 'scratchCraft.buildShape.prism0',
								default: 'prism0',
                                description: 'prism0 in Minecraft'
                            }),
                            value: 'prism0'
                        },
						
                        {
                            text: formatMessage({
                                id: 'scratchCraft.buildShape.sphere',
								default: 'sphere',
                                description: 'sphere in Minecraft'
                            }),
                            value: 'sphere'
                        },						

                        {
                            text: formatMessage({
                                id: 'scratchCraft.buildShape.sphere0',
								default: 'sphere0',
                                description: 'sphere0 in Minecraft'
                            }),
                            value: 'sphere0'
                        },	
 
                        {
                            text: formatMessage({
                                id: 'scratchCraft.buildShape.hemisphere',
								default: 'hemisphere',
                                description: 'hemisphere in Minecraft'
                            }),
                            value: 'hemisphere'
                        }, 
 
                        {
                            text: formatMessage({
                                id: 'scratchCraft.buildShape.hemisphere0',
								default: 'hemisphere0',
                                description: 'hemisphere0 in Minecraft'
                            }),
                            value: 'hemisphere0'
                        }
 
                    ]
                },				
				
                OBJECTS: {
                    acceptReporters: true,
                    items: [
                        {
                            text: formatMessage({
                                id: 'scratchCraft.object.marker',
                                default: 'marker',
                                description: 'marker'
                            }),
                            value: 'marker'
                        },

                        {
                            text: formatMessage({
                                id: 'scratchCraft.object.door',
                                default: 'door',
                                description: 'door'
                            }),
                            value: 'door'
                        },

                        {
                            text: formatMessage({
                                id: 'scratchCraft.object.torch',
                                default: 'torch',
                                description: 'torch'
                            }),
                            value: 'torch'
                        },
						
                        {
                            text: formatMessage({
                                id: 'scratchCraft.object.bed',
                                default: 'bed',
                                description: 'bed'
                            }),
                            value: 'bed'
                        },						

                        {
                            text: formatMessage({
                                id: 'scratchCraft.object.ladder',
                                default: 'ladder',
                                description: 'ladder'
                            }),
                            value: 'ladder'
                        },
						
                        {
                            text: formatMessage({
                                id: 'scratchCraft.object.stairs',
                                default: 'stairs',
                                description: 'stairs'
                            }),
                            value: 'stairs'
                        },		
                        {
                            text: formatMessage({
                                id: 'scratchCraft.object.signpost',
                                default: 'signpost',
                                description: 'signpost'
                            }),
                            value: 'signpost'
                        },		
                        {
                            text: formatMessage({
                                id: 'scratchCraft.object.wallsign',
                                default: 'wallsign',
                                description: 'wallsign'
                            }),
                            value: 'wallsign'
                        }						
                    ]
                },				

                COMMANDS: {
                    acceptReporters: true,
                    items: [
                        {
                            text: formatMessage({
                                id: 'scratchCraft.command.fwd',
                                default: 'fwd',
                                description: 'forward'
                            }),
                            value: 'fwd'
                        },

                        {
                            text: formatMessage({
                                id: 'scratchCraft.command.back',
                                default: 'back',
                                description: 'back'
                            }),
                            value: 'back'
                        },
						
                        {
                            text: formatMessage({
                                id: 'scratchCraft.command.left',
                                default: 'left',
                                description: 'left'
                            }),
                            value: 'left'
                        },	
                        {
                            text: formatMessage({
                                id: 'scratchCraft.command.right',
                                default: 'right',
                                description: 'right'
                            }),
                            value: 'right'
                        },	
                        {
                            text: formatMessage({
                                id: 'scratchCraft.command.up',
                                default: 'up',
                                description: 'up'
                            }),
                            value: 'up'
                        },							
                        {
                            text: formatMessage({
                                id: 'scratchCraft.command.down',
                                default: 'down',
                                description: 'down'
                            }),
                            value: 'down'
                        },
						{
                            text: formatMessage({
                                id: 'scratchCraft.command.turn',
                                default: 'turn',
                                description: 'turn'
                            }),
                            value: 'turn'
                        },
						{
                            text: formatMessage({
                                id: 'scratchCraft.command.reset',
                                default: 'reset',
                                description: 'reset'
                            }),
                            value: 'reset'
                        },
						{
                            text: formatMessage({
                                id: 'scratchCraft.command.save_chkpt',
                                default: 'save_chkpt',
                                description: 'save_chkpt'
                            }),
                            value: 'save_chkpt'
                        },
						{
                            text: formatMessage({
                                id: 'scratchCraft.command.goto_chkpt',
                                default: 'goto_chkpt',
                                description: 'goto_chkpt'
                            }),
                            value: 'goto_chkpt'
                        }

                    ]
                },
				
                ENTITIES: {
                    acceptReporters: true,
                    items: [
                        {
                            text: formatMessage({
                                id: 'scratchCraft.entity.Cat',
                                default: 'Cat',
                                description: 'Cat'
                            }),
                            value: 'Cat'
                        },
                        {
                            text: formatMessage({
                                id: 'scratchCraft.setTime.Chicken',
                                default: 'Chicken',
                                description: 'Chicken'
                            }),
                            value: 'Chicken'
                        },
                        {
                            text: formatMessage({
                                id: 'scratchCraft.setTime.Caw',
                                default: 'Caw',
                                description: 'Caw'
                            }),
                            value: 'Caw'
                        },
                        {
                            text: formatMessage({
                                id: 'scratchCraft.setTime.Horse',
                                default: 'Horse',
                                description: 'Horse'
                            }),
                            value: 'Horse'
                        },
                        {
                            text: formatMessage({
                                id: 'scratchCraft.setTime.Mushroom_cow',
                                default: 'Mushroom_cow',
                                description: 'Mushroom_cow'
                            }),
                            value: 'Mushroom_cow'
                        },
                        {
                            text: formatMessage({
                                id: 'scratchCraft.setTime.Pig',
                                default: 'Pig',
                                description: 'Pig'
                            }),
                            value: 'Pig'
                        },
                        {
                            text: formatMessage({
                                id: 'scratchCraft.setTime.Sheep',
                                default: 'Sheep',
                                description: 'Sheep'
                            }),
                            value: 'Sheep'
                        },
                        {
                            text: formatMessage({
                                id: 'scratchCraft.setTime.Rabbit',
                                default: 'Rabbit',
                                description: 'Rabbit'
                            }),
                            value: 'Rabbit'
                        },
                        {
                            text: formatMessage({
                                id: 'scratchCraft.setTime.Wolf',
                                default: 'Wolf',
                                description: 'Wolf'
                            }),
                            value: 'Wolf'
                        },
						{
                            text: formatMessage({
                                id: 'scratchCraft.setTime.Creeper',
                                default: 'Creeper',
                                description: 'Creeper'
                            }),
                            value: 'Creeper'
                        },                        
						{
                            text: formatMessage({
                                id: 'scratchCraft.setTime.Skeleton',
                                default: 'Skeleton',
                                description: 'Skeleton'
                            }),
                            value: 'Skeleton'
                        },                        
						{
                            text: formatMessage({
                                id: 'scratchCraft.setTime.Spider',
                                default: 'Spider',
                                description: 'Spider'
                            }),
                            value: 'Spider'
                        },                        
						{
                            text: formatMessage({
                                id: 'scratchCraft.setTime.Villager',
                                default: 'Villager',
                                description: 'Villager'
                            }),
                            value: 'Villager'
                        },                        
						{
                            text: formatMessage({
                                id: 'scratchCraft.setTime.Zombie',
                                default: 'Zombie',
                                description: 'Zombie'
                            }),
                            value: 'Zombie'
                        }

                    ]
                },
				
                ENTITY_SOUNDS: {
                    acceptReporters: true,
                    items: [
                        {
                            text: formatMessage({
                                id: 'scratchCraft.entitySound.Ambient',
                                default: 'Ambient',
                                description: 'Ambient'
                            }),
                            value: 'Ambient'
                        },
						
                        {
                            text: formatMessage({
                                id: 'scratchCraft.entitySound.Hurt',
                                default: 'Hurt',
                                description: 'Hurt'
                            }),
                            value: 'Hurt'
                        },						
                        {
                            text: formatMessage({
                                id: 'scratchCraft.entitySound.Death',
                                default: 'Death',
                                description: 'Death'
                            }),
                            value: 'Death'
                        },
					]
				},
						
                BLOCK_SOUNDS: {
                    acceptReporters: true,
                    items: [
                        {
                            text: formatMessage({
                                id: 'scratchCraft.blockSound.Glass',
                                default: 'Glass',
                                description: 'Glass sound'
                            }),
                            value: 'Glass'
                        },
						
                        {
                            text: formatMessage({
                                id: 'scratchCraft.blockSound.Grass',
                                default: 'Grass',
                                description: 'Grass sound'
                            }),
                            value: 'Grass'
                        },						
                        {
                            text: formatMessage({
                                id: 'scratchCraft.blockSound.Gravel',
                                default: 'Gravel',
                                description: 'Gravel sound'
                            }),
                            value: 'Gravel'
                        }, 

                        {
                            text: formatMessage({
                                id: 'scratchCraft.blockSound.Sand',
                                default: 'Sand',
                                description: 'Sand sound'
                            }),
                            value: 'Sand'
                        }, 
						
                        {
                            text: formatMessage({
                                id: 'scratchCraft.blockSound.Snow',
                                default: 'Snow',
                                description: 'Snow sound'
                            }),
                            value: 'Snow'
                        }, 

                        {
                            text: formatMessage({
                                id: 'scratchCraft.blockSound.Stone',
                                default: 'Stone',
                                description: 'Stone sound'
                            }),
                            value: 'Stone'
                        }, 						

                        {
                            text: formatMessage({
                                id: 'scratchCraft.blockSound.Wood',
                                default: 'Wood',
                                description: 'Wood'
                            }),
                            value: 'Wood'
                        } 

                    ]
                },		

                RECORDS: {
                    acceptReporters: true,
                    items: [
                        {
                            text: formatMessage({
                                id: 'scratchCraft.music.11',
                                default: '11',
                                description: 'record 11'
                            }),
                            value: '11'
                        },
						
                        {
                            text: formatMessage({
                                id: 'scratchCraft.music.13',
                                default: '13',
                                description: '13'
                            }),
                            value: '13'
                        },						
                        {
                            text: formatMessage({
                                id: 'scratchCraft.music.Blocks',
                                default: 'Blocks',
                                description: 'Blocks'
                            }),
                            value: 'Blocks'
                        },	

                        {
                            text: formatMessage({
                                id: 'scratchCraft.music.Cat',
                                default: 'Cat',
                                description: 'Cat'
                            }),
                            value: 'Cat'
                        },	

                        {
                            text: formatMessage({
                                id: 'scratchCraft.music.Chirp',
                                default: 'Chirp',
                                description: 'Chirp'
                            }),
                            value: 'Chirp'
                        },	

                        {
                            text: formatMessage({
                                id: 'scratchCraft.music.Far',
                                default: 'Far',
                                description: 'Far'
                            }),
                            value: 'Far'
                        },	

                        {
                            text: formatMessage({
                                id: 'scratchCraft.music.Mall',
                                default: 'Mall',
                                description: 'Mall'
                            }),
                            value: 'Mall'
                        },	

                        {
                            text: formatMessage({
                                id: 'scratchCraft.music.Mellohi',
                                default: 'Mellohi',
                                description: 'Mellohi'
                            }),
                            value: 'Mellohi'
                        },	

                        {
                            text: formatMessage({
                                id: 'scratchCraft.music.Stal',
                                default: 'Stal',
                                description: 'Stal'
                            }),
                            value: 'Stal'
                        },	

                        {
                            text: formatMessage({
                                id: 'scratchCraft.music.Strad',
                                default: 'Strad',
                                description: 'Strad'
                            }),
                            value: 'Strad'
                        },	

                        {
                            text: formatMessage({
                                id: 'scratchCraft.music.Wait',
                                default: 'Wait',
                                description: 'Wait'
                            }),
                            value: 'Wait'
                        },	

                        {
                            text: formatMessage({
                                id: 'scratchCraft.music.Ward',
                                default: 'Ward',
                                description: 'Ward'
                            }),
                            value: 'Ward'
                        }
					]
				},
				
                WEATHER: {
                    acceptReporters: true,
                    items: [
                        {
                            text: formatMessage({
                                id: 'scratchCraft.weather.clear',
                                default: 'clear',
                                description: 'clear'
                            }),
                            value: 'clear'
                        },
						
                        {
                            text: formatMessage({
                                id: 'scratchCraft.weather.rain',
                                default: 'rain',
                                description: 'rain'
                            }),
                            value: 'rain'
                        },

                        {
                            text: formatMessage({
                                id: 'scratchCraft.weather.thunders',
                                default: 'thunders',
                                description: 'thunders'
                            }),
                            value: 'thunders'
                        }

					]
				},	

                COORDINATES: {
                    acceptReporters: true,
                    items: [
                        {
                            text: formatMessage({
                                id: 'scratchCraft.coordinate.x',
                                default: 'x',
                                description: 'x'
                            }),
                            value: 'x'
                        },

                        {
                            text: formatMessage({
                                id: 'scratchCraft.coordinate.y',
                                default: 'y',
                                description: 'y'
                            }),
                            value: 'y'
                        },						
                        {
                            text: formatMessage({
                                id: 'scratchCraft.coordinate.z',
                                default: 'z',
                                description: 'z'
                            }),
                            value: 'z'
                        }

					]
				},	

                TARGETS: {
                    acceptReporters: true,
                    items: [
                        {
                            text: formatMessage({
                                id: 'scratchCraft.target.player',
                                default: 'player',
                                description: 'player'
                            }),
                            value: 'player'
                        },

                        {
                            text: formatMessage({
                                id: 'scratchCraft.target.drone',
                                default: 'drone',
                                description: 'drone'
                            }),
                            value: 'drone'
                        }

					]
				},	
				
            }
        };
    }


    /**
     * pgryko
     */
    getPollFromServer () {
	 
		const https = require("http");
		const url = this.scratchCraftAddress + "/poll";
		https.get(url, res => {
		  res.setEncoding("utf8");
		  let body = "";
		  res.on("data", data => {
			body += data;
		  });
		  res.on("end", () => {
		
			this.pollValue = body;
			//console.log(body);
			let cmd = body.split("\n");
			
			//cmd.forEach(this.dividePoll);
			cmd.forEach(this.dividePoll, this);
			
		  });
		});		 
	 
    }
	
	dividePoll(element1, index1){
		
	
		var cmd = element1.split(" "); // first part is a name, second part is a value
			switch(cmd[0]){
				case 'blockType':
					this.blockType = cmd[1];
					break;
				case 'blockData':
					this.blockData = cmd[1];
					break;					
				case 'event': 
					this.event = cmd[1];
					break;
				case 'event_action': 
					this.eventAction = cmd[1];
					break;
				case 'event_itemInHand': 
					this.eventItemInHand = cmd[1];
					break;
				case 'event_hand': 
					this.eventHand = cmd[1];
					break;
				case 'event_material': 
					this.eventMaterial = cmd[1];
					break;
				case 'event_blockFace': 
					this.eventBlockFace = cmd[1];
					break;
				case 'position/x/drone': 
					this.dronePositionX = cmd[1];
					break;
				case 'position/y/drone': 
					this.dronePositionY = cmd[1];
					break;
				case 'position/z/drone': 
					this.dronePositionZ = cmd[1];
					break;					
				case 'position/x/player': 
					this.playerPositionX = cmd[1];
					break;
				case 'position/y/player': 
					this.playerPositionY = cmd[1];
					break;
				case 'position/z/player': 
					this.playerPositionZ = cmd[1];
					break;
				//case '': 
				//	this. = cmd[1];
				//	break;
				case 'result': 
					this.result = cmd[1];
					break;
					
			}
		

	}

     /* Get...
     * @param {...} 
     * @property {...} USER_ID - user name.
     * @return {...} - a promise which will resolve at the end of the duration.
     */
	getPollValue () {
		return this.pollValue;
	}
	
     /* Get...
     * @param {...} 
     * @property {...} USER_ID - user name.
     * @return {...} - a promise which will resolve at the end of the duration.
     */
	getBlockType () {
		return this.blockType;
	}	
	
     /* Get...
     * @param {...} 
     * @property {...} USER_ID - user name.
     * @return {...} - a promise which will resolve at the end of the duration.
     */
	getBlockData () {
		return this.blockData.toString();
	}	


     /* Get...
     * @param {...} 
     * @property {...} USER_ID - user name.
     * @return {...} - a promise which will resolve at the end of the duration.
     */
	getEvent() {
		return this.event;
	}	

     /* Get...
     * @param {...} 
     * @property {...} USER_ID - user name.
     * @return {...} - a promise which will resolve at the end of the duration.
     */
	getEventAction () {
		return this.eventAction;
	}	
	
     /* Get...
     * @param {...} 
     * @property {...} USER_ID - user name.
     * @return {...} - a promise which will resolve at the end of the duration.
     */
	getItemInHand () {
		return this.itemInHand;
	}




     /* Get...
     * @param {...} 
     * @property {...} USER_ID - user name.
     * @return {...} - a promise which will resolve at the end of the duration.
     */	
	getCoordinate (args){
		
		if (args.TARGET == "player") {
			switch (args.COORDINATE){
				case "x":
					return this.playerPositionX;
					break;
				case "y":
					return this.playerPositionY;
					break;				
				case "z": 
					return this.playerPositionZ;
					break;				
			}
		} else if (args.TARGET == "drone") {
			switch (args.COORDINATE){
				case "x":
					return this.dronePositionX;
					break;
				case "y":
					return this.dronePositionY;
					break;				
				case "z": 
					return this.dronePositionZ;
					break;				
			}
		}
	}


	
     /* Get...
     * @param {...} 
     * @property {...} USER_ID - user name.
     * @return {...} - a promise which will resolve at the end of the duration.
     */
	getResult () {
		return this.result;
	}	

     /* Make ...
     * @param {object} args - the block's arguments.
     * @property {string} USER_ID - user name.
     * @return {Promise} - a promise which will resolve at the end of the duration.
     */
    connectPlayer (args) {
		const url = this.scratchCraftAddress + "/connect/" + args.USER_ID;
		this.executeCommand(url);		
		/*
        return new Promise(resolve => {

			const http = require("http");
			const url = this.scratchCraftAddress + "/connect/" + args.USER_ID;
			http.get(url, res => {
			  res.setEncoding("utf8");
			  let body = "";
			  res.on("data", data => {
				body += data;
			  });
			  res.on("end", () => {
			
				this.userName = args.USER_ID;
				console.log(body);
			  });
			});	

            // Run for some time 
            setTimeout(resolve, 300);
        });
		*/
    }	
	

     /* Make ...
     * @param {object} args - the block's arguments.
     * @property {string} USER_ID - user name.
     * @return {Promise} - a promise which will resolve at the end of the duration.
     */
    resetConnection (args) {
			const url = this.scratchCraftAddress + "/reset_all";
			this.executeCommand(url);		

		/*		
        return new Promise(resolve => {
			const http = require("http");
			const url = this.scratchCraftAddress + "/reset_all";
			http.get(url, res => {
			  res.setEncoding("utf8");
			  let body = "";
			  res.on("data", data => {
				body += data;
			  });
			  res.on("end", () => {

				console.log(body);
			  });
			});	

            // Run for some time 
            setTimeout(resolve, 300);
        });
		*/
    }		
	
	
     /* Make ...
     * @param {object} args - the block's arguments.
     * @property {string} USER_ID - user name.
     * @return {Promise} - a promise which will resolve at the end of the duration.
     */
    setTime (args) {
		const url = this.scratchCraftAddress + "/time/" + args.TIME_ID;
		this.executeCommand (url);
					
		/*
        return new Promise(resolve => {

			const http = require("http");
			const url = this.scratchCraftAddress + "/time/" + args.TIME_ID;
			http.get(url, res => {
			  res.setEncoding("utf8");
			  let body = "";
			  res.on("data", data => {
				body += data;
			  });
			  res.on("end", () => {
			
				// this.userName = args.USER_ID;
				// console.log(body);
			  });
			});	

            // Run for some time 
            setTimeout(resolve, 500);
        });
		*/
    }

     /* For building scriptCraft commands: box, box0, cylinder, prism, etc
     * @param {...} 
     * @property {...} .
     * @return {...} - a promise which will resolve at the end of the duration.
     */
    buildShape (args) {
		const url = this.scratchCraftAddress + "/build/" + args.SHAPE + '/' + args.BLOCK_TYPE + '/' + args.BLOCK_DATA + '/' + args.BLOCK_X + '/' + args.BLOCK_Y + '/' + args.BLOCK_Z  ;
		this.executeCommand (url);
	}	

     /* For ...
     * @param {...} 
     * @property {...} .
     * @return {...} - a promise which will resolve at the end of the duration.
     */
    place (args) {
		const url = this.scratchCraftAddress + "/place/" + args.OBJECT + '/' + args.PAR_1 + '/' + args.PAR_1 + '/' + args.PAR_2 + '/' + args.PAR_3 + '/' + args.PAR_4;
		this.executeCommand (url);
	}	

     /* For ...
     * @param {...} 
     * @property {...} .
     * @return {...} - a promise which will resolve at the end of the duration.
     */
    rainbow (args) {
		const url = this.scratchCraftAddress + "/rainbow/" + args.RADIUS;
		this.executeCommand (url);
	}	

     /* For ...
     * @param {...} 
     * @property {...} .
     * @return {...} - a promise which will resolve at the end of the duration.
     */
    moveDrone (args) {
		const url = this.scratchCraftAddress + "/moveDrone/" + args.COMMAND + '/' + args.COUNT;
		this.executeCommand (url);
	}

     /* For ...
     * @param {...} 
     * @property {...} .
     * @return {...} - a promise which will resolve at the end of the duration.
     */
    summon (args) {
		const url = this.scratchCraftAddress + "/summon/" + args.ENTITY;
		this.executeCommand (url);
	}

     /* For ...
     * @param {...} 
     * @property {...} .
     * @return {...} - a promise which will resolve at the end of the duration.
     */
    entitySound (args) {
		const url = this.scratchCraftAddress + "/entitySound/" + args.ENTITY + '/' + args.ENTITY_SOUND + '/' + args.PLAYER;
		this.executeCommand (url);
	}	
	
	     /* For ...
     * @param {...} 
     * @property {...} .
     * @return {...} - a promise which will resolve at the end of the duration.
     */
    blockSound (args) {
		const url = this.scratchCraftAddress + "/blockSound/" + args.BLOCK + '/' + args.BLOCK_SOUND + '/' + args.PLAYER;
		this.executeCommand (url);
	}	

	     /* For ...
     * @param {...} 
     * @property {...} .
     * @return {...} - a promise which will resolve at the end of the duration.
     */
    teleport (args) {
		const url = this.scratchCraftAddress + "/teleport/" + args.PLAYER_NAME + '/' +  args.TELEPORT_TYPE  + '/' +  args.TELEPORT_X  + '/' +  args.TELEPORT_Y  + '/' +  args.TELEPORT_Z;
		this.executeCommand (url);
	}

	     /* For ...
     * @param {...} 
     * @property {...} .
     * @return {...} - a promise which will resolve at the end of the duration.
     */
    turn (args) {
		const url = this.scratchCraftAddress + "/turn/" + args.PLAYER_NAME + '/' +  args.TURN_TYPE  + '/' +  args.TURN_X  + '/' +  args.TURN_Y  + '/' +  args.TURN_Z;
		this.executeCommand (url);
	}

	     /* For ...
     * @param {...} 
     * @property {...} .
     * @return {...} - a promise which will resolve at the end of the duration.
     */
    setTime (args) {
		const url = this.scratchCraftAddress + "/time/" + args.TIME_ID;
		this.executeCommand (url);
	}

	     /* For ...
     * @param {...} 
     * @property {...} .
     * @return {...} - a promise which will resolve at the end of the duration.
     */
    setWeather (args) {
		const url = this.scratchCraftAddress + "/weather/" + args.WEATHER;
		this.executeCommand (url);
	}

	     /* For ...
     * @param {...} 
     * @property {...} .
     * @return {...} - a promise which will resolve at the end of the duration.
     */
    resetEvent (args) {
		const url = this.scratchCraftAddress + "/reset_event/";
		this.executeCommand (url);
	}

     /* Executes scratchCraft command
     * @param {...} 
     * @property {...} .
     * @return {...} - a promise which will resolve at the end of the duration.
     */
	executeCommand (url) {
        return new Promise(resolve => {

			const http = require("http");
			http.get(url, res => {
			  res.setEncoding("utf8");
			  let body = "";
			  res.on("data", data => {
				body += data;
			  });
			  //res.on("end", () => { });
			});	

            // Run for some time 
            setTimeout(resolve, 500);
        });		
	}


}

module.exports = ScratchCraft;
