import { useState } from 'react'
import { Search, BookOpen, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import DOMPurify from 'dompurify'
import './App.css'

// API 配置常量
const API_CONFIG = {
    BASE_URL: 'https://apis.tianapi.com/xhzd/index',
    API_KEY: ''
}

function App() {
    const [query, setQuery] = useState('')
    const [result, setResult] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    // 验证输入
    const validateInput = () => {
        if (!query.trim()) {
            setError('请输入一个汉字')
            return false
        }

        if (query.length !== 1) {
            setError('请输入单个汉字')
            return false
        }

        return true
    }

    // 获取数据
    const fetchData = async () => {
        try {
            const response = await fetch(
                `${API_CONFIG.BASE_URL}?key=${API_CONFIG.API_KEY}&word=${encodeURIComponent(query)}`
            )

            if (!response.ok) {
                throw new Error('网络响应异常')
            }

            const data = await response.json()

            if (data.code !== 200) {
                throw new Error(data.msg || '查询失败')
            }

            const list = data.result.list

            setResult(list[0])
        } catch (err) {
            setError(err.message || '查询失败，请稍后重试')
            console.error('Search error:', err)
        } finally {
            setLoading(false)
        }
    }

    const handleSearch = async () => {
        if (!validateInput()) return

        setLoading(true)
        setError('')
        setResult(null)

        await fetchData()
    }

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearch()
        }
    }

    // 安全渲染HTML内容
    const renderHTML = (html) => {
        return { __html: DOMPurify.sanitize(html) }
    }

    // 结果卡片组件
    const ResultCard = ({ title, content }) => (
        <Card className="mb-6">
            <CardHeader>
                <CardTitle className="text-xl text-blue-600">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={renderHTML(content)} />
            </CardContent>
        </Card>
    )

    // 基本信息卡片
    const BasicInfoCard = () => (
        <Card className="mb-6">
            <CardHeader className="text-center">
                <div className="flex justify-center gap-2 mb-2">
                    <Badge variant="secondary" className="text-lg px-3 py-1">
                        {result.pyyb || result.py}
                    </Badge>
                </div>
                <div className="text-6xl font-bold text-blue-600 mb-2">
                    {result.hanzi}
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="text-center">
                        <p className="text-sm text-gray-500">部首</p>
                        <p className="font-semibold">{result.bushou}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-sm text-gray-500">笔画</p>
                        <p className="font-semibold">{result.bihua}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-sm text-gray-500">五笔</p>
                        <p className="font-semibold">{result.wubi}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-sm text-gray-500">笔顺</p>
                        <p className="font-semibold">{result.bishun}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    )

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center mb-4">
                        <BookOpen className="h-8 w-8 text-blue-600 mr-2" />
                        <h1 className="text-3xl font-bold text-gray-800">汉字释义查询</h1>
                    </div>
                    <p className="text-gray-600">输入汉字，查看详细释义和基本信息</p>
                </div>

                {/* Search Section */}
                <div className="max-w-md mx-auto mb-8">
                    <div className="flex gap-2">
                        <Input
                            type="text"
                            placeholder="请输入一个汉字..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyPress={handleKeyPress}
                            className="text-lg text-center"
                            maxLength={1}
                        />
                        <Button
                            onClick={handleSearch}
                            disabled={loading}
                            className="px-6"
                        >
                            {loading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Search className="h-4 w-4" />
                            )}
                        </Button>
                    </div>
                    {error && (
                        <p className="text-red-500 text-sm mt-2 text-center">{error}</p>
                    )}
                </div>

                {/* Results Section */}
                {result && (
                    <div className="max-w-4xl mx-auto">
                        <BasicInfoCard />

                        {result.content && (
                            <ResultCard title="基本释义" content={result.content} />
                        )}

                        {result.explain && (
                            <ResultCard title="详细解释" content={result.explain} />
                        )}
                    </div>
                )}

                {/* Welcome Message */}
                {!result && !loading && (
                    <div className="text-center text-gray-500 mt-12">
                        <BookOpen className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                        <p className="text-lg">在上方输入框中输入汉字开始查询</p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default App