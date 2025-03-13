import { ethers, InterfaceAbi, TransactionDescription } from 'ethers';

export const startHexWith0x = (hexValue?: string): string => {
  return hexValue
    ? hexValue.startsWith('0x')
      ? hexValue === '0x'
        ? '0x'
        : hexValue
      : `0x${hexValue}`
    : '0x';
};

export function decodeWithABI({
  abi,
  calldata,
}: {
  abi: InterfaceAbi;
  calldata: string;
}): TransactionDescription | null {
  const abiInterface = new ethers.Interface(abi);
  const parsedTransaction = abiInterface.parseTransaction({ data: calldata });
  return parsedTransaction;
}
