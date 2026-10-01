import { Address } from 'viem';
export const CONTRACT_ADDRESS = (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000') as Address;
export const TESTNET_CONTRACT_ADDRESS = (process.env.NEXT_PUBLIC_TESTNET_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000') as Address;
export const abi = [
  {type:'function',name:'join',stateMutability:'nonpayable',inputs:[],outputs:[]},
  {type:'function',name:'CREDIT_LIMIT',stateMutability:'view',inputs:[],outputs:[{type:'int256'}]},
  {type:'function',name:'transferCredit',stateMutability:'nonpayable',inputs:[{name:'to',type:'address'},{name:'amount',type:'int256'}],outputs:[]},
  {type:'function',name:'members',stateMutability:'view',inputs:[{name:'account',type:'address'}],outputs:[{name:'exists',type:'bool'},{name:'creditLimit',type:'int256'},{name:'balance',type:'int256'}]},
  {type:'function',name:'transactionCount',stateMutability:'view',inputs:[],outputs:[{type:'uint256'}]},
  {type:'event',name:'MemberJoined',inputs:[{indexed:true,name:'member',type:'address'},{indexed:false,name:'creditLimit',type:'int256'}]},
  {type:'event',name:'CreditTransferred',inputs:[{indexed:true,name:'from',type:'address'},{indexed:true,name:'to',type:'address'},{indexed:false,name:'amount',type:'int256'}]}
] as const;
