import { Button, Input, message, Tooltip } from 'antd';
import { useState } from 'react';
import Editor from '@monaco-editor/react';
import { DecodeRecursiveResult } from '@/types';
import { startHexWith0x, decodeWithABI } from '@/utils';
import { stringify } from 'viem';
import CopyToClipboard from './CopyToClipboard';

const { TextArea } = Input;

// const raw = '0xa9059cbb000000000000000000000000123456789012345678901234567890123456789000000000000000000000000000000000000000000000000000000000000003e8';

// const functionABI =
//     [
//         {
//             "type": "function",
//             "name": "transfer",
//             "stateMutability": "nonpayable",
//             "inputs": [
//                 { "name": "to", "type": "address" },
//                 { "name": "value", "type": "uint256" }
//             ],
//             "outputs": [{ "type": "bool" }]
//         }
//     ];

const TransferBox: React.FC = () => {
  const [ABI, setABI] = useState('');
  const [rawTransition, setRawTransition] = useState('');
  const [tranferedResult, setTranferedResult] = useState<DecodeRecursiveResult>(
    {} as DecodeRecursiveResult,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleEditorDidMount = (editor: any) => {
    editor.onDidPaste(() => {
      setTimeout(() => {
        try {
          const editorContent = editor.getValue();
          const parsedContent = JSON.parse(editorContent);
          const formattedJson = JSON.stringify(parsedContent, null, 2);
          editor.setValue(formattedJson);
        } catch (error) {
          console.warn('Invalid JSON input.');
        }
      }, 0);
    });
  };

  const decode = ({
    calldata,
    abi,
  }: {
    calldata: string;
    abi: string;
  }): DecodeRecursiveResult => {
    try {
      setIsLoading(true);

      const parsedTransaction = decodeWithABI({
        calldata: startHexWith0x(calldata),
        abi,
      });
      console.log('parsedTransaction:', parsedTransaction);

      if (parsedTransaction) {
        setErrorMsg(null);
        messageApi.open({
          type: 'success',
          content: 'Successfully Decoded',
        });
        return {
          functionName: parsedTransaction.fragment.name,
          signature: parsedTransaction.signature,
          stateMutability: parsedTransaction.fragment.stateMutability,
          rawArgs: parsedTransaction.args,
          args: parsedTransaction.fragment.inputs.map((input, index) => {
            return {
              name: input.name,
              baseType: input.baseType,
              type: input.type,
              rawValue: parsedTransaction.args[index],
            };
          }),
        };
      } else {
        throw new Error('Unable to decode this calldata');
      }
    } catch (e: any) {
      console.log('decode error', e);
      messageApi.open({
        type: 'error',
        content: e.message,
      });
      setErrorMsg(e.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const onClickHandler = () => {
    const rs = decode({ calldata: rawTransition, abi: ABI });
    console.log('TranferedResult:', rs);
    setTranferedResult(rs);
  };

  return (
    <div className="flex flex-col gap-4 w-[800px]">
      {contextHolder}
      <div>
        <h2 className="text-zinc-500 pb-2">Input ABI:</h2>
        <div className="border border-solid border-gray-300 rounded-sm overflow-hidden">
          <Editor
            height="300px"
            defaultLanguage="json"
            value={ABI}
            onChange={(value) => setABI(value || '')}
            options={{
              formatOnPaste: true,
              formatOnType: true,
              minimap: { enabled: false },
            }}
            onMount={handleEditorDidMount}
            onValidate={(markers) => {
              markers.forEach((marker) =>
                console.error('JSON error:', marker.message),
              );
            }}
          />
        </div>
      </div>
      <div>
        <h2 className="text-zinc-500 pb-2">Calldata:</h2>
        <TextArea
          rows={4}
          placeholder="input calldata"
          value={rawTransition}
          onChange={(e) => {
            setRawTransition(e.target.value);
          }}
        />
      </div>
      <Button
        size="large"
        type="primary"
        onClick={onClickHandler}
        loading={isLoading}
      >
        Transfer
      </Button>
      {tranferedResult && Object.keys(tranferedResult).length > 0 && (
        <>
          <div className="flex justify-between items-end">
            <div>
              <div className="flex gap-4 items-center">
                <div className="text-zinc-500">function:</div>
                <div className="font-medium">
                  {tranferedResult.functionName}
                </div>
              </div>
              <div className="flex gap-4 items-center">
                <div className="text-zinc-500">signature:</div>
                <div className="font-medium">{tranferedResult.signature}</div>
              </div>
              <div className="flex gap-4 items-center">
                <div className="text-zinc-500">stateMutability:</div>
                <div className="font-medium">
                  {tranferedResult.stateMutability}
                </div>
              </div>
            </div>
            <CopyToClipboard
              value={JSON.stringify(
                {
                  function: tranferedResult.signature,
                  params: JSON.parse(stringify(tranferedResult.rawArgs)),
                },
                undefined,
                2,
              )}
            />
          </div>
          <div className="border border-gray-300 border-solid rounded-sm overflow-hidden">
            <div className="flex items-center bg-gray-100 font-medium p-2">
              <span className="w-40">Name</span>
              <span className="w-40">Type</span>
              <span className="flex-1">Data</span>
            </div>
            <div>
              {tranferedResult.args?.map((item, index) => {
                return (
                  <div
                    key={index}
                    className="p-2 flex items-center border-b-1 border-solid border-gray-200 last:border-none"
                  >
                    <span className="w-40">{item.name}</span>
                    <span className="w-40">{item.type}</span>
                    <Tooltip title={item.rawValue}>
                      <span className="flex-1 text-ellipsis overflow-hidden cursor-pointer">
                        {item.rawValue}
                      </span>
                    </Tooltip>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
      {errorMsg && <div className="text-red-500">{`Error: ${errorMsg}`}</div>}
    </div>
  );
};

export default TransferBox;
