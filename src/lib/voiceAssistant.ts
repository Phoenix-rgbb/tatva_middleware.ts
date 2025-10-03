import { VoiceCommand } from '@/types';

export class VoiceAssistant {
  private recognition: any = null;
  private isListening = false;

  constructor() {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
    }
  }

  isSupported(): boolean {
    return this.recognition !== null;
  }

  async startListening(language: 'en' | 'hi' | 'mr' = 'en'): Promise<string> {
    if (!this.recognition) {
      throw new Error('Speech recognition not supported');
    }

    const langMap = {
      en: 'en-US',
      hi: 'hi-IN',
      mr: 'mr-IN',
    };

    this.recognition.lang = langMap[language];

    return new Promise((resolve, reject) => {
      this.recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        this.isListening = false;
        resolve(transcript);
      };

      this.recognition.onerror = (event: any) => {
        this.isListening = false;
        reject(new Error(event.error));
      };

      this.recognition.onend = () => {
        this.isListening = false;
      };

      this.isListening = true;
      this.recognition.start();
    });
  }

  stopListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  parseCommand(transcript: string, language: 'en' | 'hi' | 'mr' = 'en'): VoiceCommand | null {
    const lowerTranscript = transcript.toLowerCase();

    if (language === 'hi') {
      return this.parseHindiCommand(lowerTranscript);
    } else if (language === 'mr') {
      return this.parseMarathiCommand(lowerTranscript);
    }

    return this.parseEnglishCommand(lowerTranscript);
  }

  private parseEnglishCommand(text: string): VoiceCommand | null {
    const addIncomePatterns = [
      /add income (?:of )?(?:rupees? |rs\.? |₹)?(\d+)(?: for| from)? (.*)/i,
      /received (?:rupees? |rs\.? |₹)?(\d+)(?: for| from)? (.*)/i,
      /sale (?:of )?(?:rupees? |rs\.? |₹)?(\d+)(?: for)? (.*)/i,
    ];

    const addExpensePatterns = [
      /add expense (?:of )?(?:rupees? |rs\.? |₹)?(\d+)(?: for)? (.*)/i,
      /spent (?:rupees? |rs\.? |₹)?(\d+)(?: on)? (.*)/i,
      /paid (?:rupees? |rs\.? |₹)?(\d+)(?: for)? (.*)/i,
    ];

    const queryPatterns = [
      /show (today'?s?|this week'?s?|this month'?s?) (sales|revenue|expenses|profit)/i,
      /what is (my|the) (total revenue|total expense|profit)/i,
      /how much did i (earn|spend|make) (today|this week|this month)/i,
    ];

    const stockPatterns = [
      /check stock (?:for |of )?(.*)/i,
      /how many (.*) (?:do i have|in stock)/i,
      /stock level (?:of |for )?(.*)/i,
    ];

    for (const pattern of addIncomePatterns) {
      const match = text.match(pattern);
      if (match) {
        return {
          command: text,
          intent: 'add_transaction',
          parameters: {
            type: 'income',
            amount: parseFloat(match[1]),
            description: match[2].trim(),
          },
          language: 'en',
        };
      }
    }

    for (const pattern of addExpensePatterns) {
      const match = text.match(pattern);
      if (match) {
        return {
          command: text,
          intent: 'add_transaction',
          parameters: {
            type: 'expense',
            amount: parseFloat(match[1]),
            description: match[2].trim(),
          },
          language: 'en',
        };
      }
    }

    for (const pattern of queryPatterns) {
      const match = text.match(pattern);
      if (match) {
        return {
          command: text,
          intent: 'query_data',
          parameters: {
            period: match[1]?.replace(/['s]/g, '') || 'today',
            metric: match[2],
          },
          language: 'en',
        };
      }
    }

    for (const pattern of stockPatterns) {
      const match = text.match(pattern);
      if (match) {
        return {
          command: text,
          intent: 'check_stock',
          parameters: {
            product: match[1]?.trim(),
          },
          language: 'en',
        };
      }
    }

    if (text.includes('show') && (text.includes('dashboard') || text.includes('analytics'))) {
      return {
        command: text,
        intent: 'show_analytics',
        parameters: {},
        language: 'en',
      };
    }

    return null;
  }

  private parseHindiCommand(text: string): VoiceCommand | null {
    if (text.includes('आय') || text.includes('बिक्री') || text.includes('मिला')) {
      const amountMatch = text.match(/(\d+)/);
      if (amountMatch) {
        return {
          command: text,
          intent: 'add_transaction',
          parameters: {
            type: 'income',
            amount: parseFloat(amountMatch[1]),
            description: text,
          },
          language: 'hi',
        };
      }
    }

    if (text.includes('खर्च') || text.includes('दिया') || text.includes('पेमेंट')) {
      const amountMatch = text.match(/(\d+)/);
      if (amountMatch) {
        return {
          command: text,
          intent: 'add_transaction',
          parameters: {
            type: 'expense',
            amount: parseFloat(amountMatch[1]),
            description: text,
          },
          language: 'hi',
        };
      }
    }

    if (text.includes('दिखाओ') || text.includes('बताओ')) {
      return {
        command: text,
        intent: 'show_analytics',
        parameters: {},
        language: 'hi',
      };
    }

    return null;
  }

  private parseMarathiCommand(text: string): VoiceCommand | null {
    if (text.includes('उत्पन्न') || text.includes('विक्री') || text.includes('मिळाला')) {
      const amountMatch = text.match(/(\d+)/);
      if (amountMatch) {
        return {
          command: text,
          intent: 'add_transaction',
          parameters: {
            type: 'income',
            amount: parseFloat(amountMatch[1]),
            description: text,
          },
          language: 'mr',
        };
      }
    }

    if (text.includes('खर्च') || text.includes('दिला') || text.includes('पेमेंट')) {
      const amountMatch = text.match(/(\d+)/);
      if (amountMatch) {
        return {
          command: text,
          intent: 'add_transaction',
          parameters: {
            type: 'expense',
            amount: parseFloat(amountMatch[1]),
            description: text,
          },
          language: 'mr',
        };
      }
    }

    if (text.includes('दाखवा') || text.includes('सांग')) {
      return {
        command: text,
        intent: 'show_analytics',
        parameters: {},
        language: 'mr',
      };
    }

    return null;
  }

  speak(text: string, language: 'en' | 'hi' | 'mr' = 'en') {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      const langMap = {
        en: 'en-US',
        hi: 'hi-IN',
        mr: 'mr-IN',
      };
      utterance.lang = langMap[language];
      window.speechSynthesis.speak(utterance);
    }
  }
}

export const voiceAssistant = new VoiceAssistant();
