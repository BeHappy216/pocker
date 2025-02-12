import {useEffect, useState} from 'react';
import {getAccessKey, isAuthenticated, setAccessKey} from '@/utils/auth';
import {Geist, Geist_Mono} from "next/font/google";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export default function HomePage() {
    const [key, setKey] = useState('');
    const [isAuth, setIsAuth] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [quotaData, setQuotaData] = useState(null);

    useEffect(() => {
        // 检查是否已认证
        setIsAuth(isAuthenticated());
        setLoading(false);
    }, []);

    useEffect(() => {
        // 如果已认证，获取配额信息
        if (isAuth) {
            fetchQuotaData();
        }
    }, [isAuth]);

    const fetchQuotaData = async () => {
        try {
            const response = await fetch('/api/tcr/quota', {
                headers: {
                    'x-access-key': getAccessKey(),
                },
            });
            const data = await response.json();
            setQuotaData(data.Data);
        } catch (error) {
            console.error('获取配额信息失败:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const response = await fetch('/api/verify-key', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({key}),
            });

            const data = await response.json();

            if (data.success) {
                setAccessKey(key);
                setIsAuth(true);
            } else {
                setError('密钥无效');
            }
        } catch (err) {
            setError('验证过程出错');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (isAuth) {
        return (
            <div className="container mx-auto p-4">
                <h1 className="text-2xl font-bold mb-4">欢迎访问</h1>
                <p className="text-gray-600 mb-6">您已成功通过验证</p>

                {quotaData && (
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-xl font-semibold mb-4">腾讯容器镜像服务个人配额信息</h2>
                        <div className="space-y-4">
                            {quotaData.LimitInfo.map((item, index) => (
                                <div key={index}
                                     className="flex items-center justify-between border-b border-gray-200 pb-2">
                                    <p className="text-sm text-gray-500">用户名: <span
                                        className="font-mono">{item.Username}</span></p>
                                    <p className="text-sm text-gray-500">类型: <span
                                        className="font-mono">{item.Type}</span></p>
                                    <p className="text-sm text-gray-500">配额值: <span
                                        className="font-mono text-blue-600">{item.Value}</span></p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
                <div>
                    <h2 className="text-center text-3xl font-extrabold text-gray-900">
                        请输入访问密钥
                    </h2>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div>
                        <input
                            type="password"
                            value={key}
                            onChange={(e) => setKey(e.target.value)}
                            className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            placeholder="请输入密钥"
                            required
                        />
                    </div>
                    {error && (
                        <div className="text-red-500 text-sm text-center">{error}</div>
                    )}
                    <div>
                        <button
                            type="submit"
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            验证
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
