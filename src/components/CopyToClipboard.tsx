import { message, Button } from 'antd';
import copy from 'copy-to-clipboard';
import { useState } from 'react';

export default function CopyToClipboard({ value }: { value: string }) {
  const [copySuccess, setCopySuccess] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const handleCopy = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      copy(value);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 3000);
      messageApi.open({
        type: 'success',
        content: 'opied Successfully',
      });
    } catch (e) {
      messageApi.open({
        type: 'error',
        content: 'Copy failed, please copy by yourself.',
      });
    }
  };
  return (
    <div>
      {contextHolder}
      <Button onClick={handleCopy}>
        {copySuccess ? 'Copied' : 'Cpoy Params'}
      </Button>
    </div>
  );
}
