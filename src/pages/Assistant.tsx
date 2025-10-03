import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { db } from '@/lib/database';
import { voiceAssistant } from '@/lib/voiceAssistant';
import { analytics } from '@/lib/analytics';
import { Mic, MicOff, Send, Bot, User, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function Assistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m your SMB assistant. You can ask me about your sales, expenses, inventory, or use voice commands to add transactions. Try: "Show today\'s sales" or "Add income of 5000 for product sale"',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [language, setLanguage] = useState<'en' | 'hi' | 'mr'>('en');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const addMessage = (role: 'user' | 'assistant', content: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      role,
      content,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const processQuery = (query: string) => {
    const lowerQuery = query.toLowerCase();
    const transactions = db.getTransactions();
    const products = db.getProducts();

    if (lowerQuery.includes('today') && (lowerQuery.includes('sales') || lowerQuery.includes('revenue'))) {
      const today = new Date().toISOString().split('T')[0];
      const todaySales = transactions
        .filter(t => t.type === 'income' && t.date.startsWith(today))
        .reduce((sum, t) => sum + t.amount, 0);
      return `Today's sales total is ₹${todaySales.toLocaleString()}.`;
    }

    if (lowerQuery.includes('today') && lowerQuery.includes('expense')) {
      const today = new Date().toISOString().split('T')[0];
      const todayExpenses = transactions
        .filter(t => t.type === 'expense' && t.date.startsWith(today))
        .reduce((sum, t) => sum + t.amount, 0);
      return `Today's expenses total is ₹${todayExpenses.toLocaleString()}.`;
    }

    if (lowerQuery.includes('total') && (lowerQuery.includes('revenue') || lowerQuery.includes('income'))) {
      const totalRevenue = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
      return `Your total revenue is ₹${totalRevenue.toLocaleString()}.`;
    }

    if (lowerQuery.includes('total') && lowerQuery.includes('expense')) {
      const totalExpenses = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
      return `Your total expenses are ₹${totalExpenses.toLocaleString()}.`;
    }

    if (lowerQuery.includes('profit')) {
      const metrics = analytics.calculateMetrics(transactions, products);
      return `Your net profit is ₹${metrics.netProfit.toLocaleString()} with a profit margin of ${metrics.profitMargin.toFixed(1)}%.`;
    }

    if (lowerQuery.includes('low stock') || lowerQuery.includes('stock alert')) {
      const lowStock = db.getLowStockProducts();
      if (lowStock.length === 0) {
        return 'All products are adequately stocked!';
      }
      return `You have ${lowStock.length} products with low stock: ${lowStock.map(p => p.name).join(', ')}`;
    }

    if (lowerQuery.includes('top product') || lowerQuery.includes('best seller')) {
      const metrics = analytics.calculateMetrics(transactions, products);
      if (metrics.topProducts.length === 0) {
        return 'No product sales data available yet.';
      }
      const top = metrics.topProducts[0];
      return `Your top product is "${top.product.name}" with ₹${top.revenue.toLocaleString()} in revenue.`;
    }

    if (lowerQuery.includes('how many product') || lowerQuery.includes('product count')) {
      return `You have ${products.length} products in your inventory.`;
    }

    if (lowerQuery.includes('transaction') && lowerQuery.includes('count')) {
      return `You have ${transactions.length} transactions recorded.`;
    }

    return 'I can help you with sales, expenses, inventory, and profit queries. Try asking about today\'s sales, total revenue, low stock items, or top products.';
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim()) return;

    const userQuery = input;
    setInput('');
    addMessage('user', userQuery);

    const command = voiceAssistant.parseCommand(userQuery, language);

    if (command && command.intent === 'add_transaction') {
      const transaction = db.addTransaction({
        type: command.parameters.type,
        amount: command.parameters.amount || 0,
        category: 'Sales',
        description: command.parameters.description || 'Voice transaction',
        date: new Date().toISOString(),
      });

      const response = `Transaction added successfully! ${command.parameters.type === 'income' ? 'Income' : 'Expense'} of ₹${command.parameters.amount} has been recorded.`;
      addMessage('assistant', response);
      voiceAssistant.speak(response, language);
    } else {
      const response = processQuery(userQuery);
      addMessage('assistant', response);
      voiceAssistant.speak(response, language);
    }
  };

  const handleVoiceInput = async () => {
    if (!voiceAssistant.isSupported()) {
      toast.error('Voice input not supported in your browser');
      return;
    }

    try {
      setIsListening(true);
      const transcript = await voiceAssistant.startListening(language);
      setInput(transcript);
      addMessage('user', transcript);

      const command = voiceAssistant.parseCommand(transcript, language);

      if (command && command.intent === 'add_transaction') {
        const transaction = db.addTransaction({
          type: command.parameters.type,
          amount: command.parameters.amount || 0,
          category: 'Sales',
          description: command.parameters.description || 'Voice transaction',
          date: new Date().toISOString(),
        });

        const response = `Transaction added! ${command.parameters.type === 'income' ? 'Income' : 'Expense'} of ₹${command.parameters.amount} recorded.`;
        addMessage('assistant', response);
        voiceAssistant.speak(response, language);
      } else if (command && command.intent === 'query_data') {
        const response = processQuery(transcript);
        addMessage('assistant', response);
        voiceAssistant.speak(response, language);
      } else {
        const response = processQuery(transcript);
        addMessage('assistant', response);
        voiceAssistant.speak(response, language);
      }

      setInput('');
    } catch (error: any) {
      toast.error(`Voice input failed: ${error.message}`);
    } finally {
      setIsListening(false);
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-8 h-8 text-blue-600" />
            Smart Assistant
          </h1>
          <p className="text-slate-600 mt-1">Chat or speak to manage your business</p>
        </div>
        <Select value={language} onValueChange={(v: any) => setLanguage(v)}>
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="en">English</SelectItem>
            <SelectItem value="hi">हिन्दी (Hindi)</SelectItem>
            <SelectItem value="mr">मराठी (Marathi)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="flex-1 flex flex-col">
        <CardContent className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map(message => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-5 h-5 text-blue-600" />
                </div>
              )}
              <div
                className={`max-w-[70%] rounded-lg p-4 ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-900'
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <p
                  className={`text-xs mt-1 ${
                    message.role === 'user' ? 'text-blue-100' : 'text-slate-500'
                  }`}
                >
                  {format(message.timestamp, 'HH:mm')}
                </p>
              </div>
              {message.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-slate-600" />
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </CardContent>

        <div className="p-4 border-t">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message or ask a question..."
              className="flex-1"
              disabled={isListening}
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={handleVoiceInput}
              disabled={isListening}
              className={isListening ? 'bg-red-50' : ''}
            >
              {isListening ? (
                <MicOff className="w-4 h-4 animate-pulse text-red-600" />
              ) : (
                <Mic className="w-4 h-4" />
              )}
            </Button>
            <Button type="submit" size="icon" disabled={!input.trim()}>
              <Send className="w-4 h-4" />
            </Button>
          </form>
          <div className="mt-2 flex flex-wrap gap-2">
            <Badge
              variant="outline"
              className="cursor-pointer hover:bg-slate-100"
              onClick={() => setInput("Show today's sales")}
            >
              Today's sales
            </Badge>
            <Badge
              variant="outline"
              className="cursor-pointer hover:bg-slate-100"
              onClick={() => setInput('What is my total profit?')}
            >
              Total profit
            </Badge>
            <Badge
              variant="outline"
              className="cursor-pointer hover:bg-slate-100"
              onClick={() => setInput('Check low stock items')}
            >
              Low stock
            </Badge>
            <Badge
              variant="outline"
              className="cursor-pointer hover:bg-slate-100"
              onClick={() => setInput('Add income of 5000 for sales')}
            >
              Add income
            </Badge>
          </div>
        </div>
      </Card>
    </div>
  );
}
