"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from "next/image";

interface Option {
  id: string;
  text: string;
}

interface BaseQuestion {
  id: number;
  question: string;
  correctAnswer: string;
}

interface MultipleChoiceQuestion extends BaseQuestion {
  type: 'multiple-choice';
  options: Option[];
}

interface InputQuestion extends BaseQuestion {
  type: 'input';
}

type Question = MultipleChoiceQuestion | InputQuestion;

const STUDENT_QUESTIONS: Question[] = [
  {
    id: 1,
    type: 'multiple-choice',
    question: "Your level of English",
    options: [
      { id: "a", text: "A1" },
      { id: "b", text: "A2" },
      { id: "c", text: "B1" },
      { id: "d", text: "B2" },
      { id: "e", text: "C1" },
      { id: "f", text: "I have no idea" }
    ],
    correctAnswer: "f"
  },
  {
    id: 2,
    type: 'multiple-choice',
    question: "... you Ukrainian?",
    options: [
      { id: "a", text: "Is" },
      { id: "b", text: "Do" },
      { id: "c", text: "Are" },
      { id: "d", text: "Be" },
      { id: "e", text: "I don't know" }
    ],
    correctAnswer: "c"
  },
  {
    id: 3,
    type: 'multiple-choice',
    question: "My friend is ... IT specialist.",
    options: [
      { id: "a", text: "the" },
      { id: "b", text: "a" },
      { id: "c", text: "an" },
      { id: "d", text: "at" },
      { id: "e", text: "I don't know" }
    ],
    correctAnswer: "c"
  },
  {
    id: 4,
    type: 'multiple-choice',
    question: "That project is ... than this one.",
    options: [
      { id: "a", text: "successfuler" },
      { id: "b", text: "most successful" },
      { id: "c", text: "more successful" },
      { id: "d", text: "successful" },
      { id: "e", text: "I don't know" }
    ],
    correctAnswer: "c"
  },
  {
    id: 5,
    type: 'multiple-choice',
    question: "He ... horror films.",
    options: [
      { id: "a", text: "don't like" },
      { id: "b", text: "likes not" },
      { id: "c", text: "doesn't like" },
      { id: "d", text: "isn't like" },
      { id: "e", text: "I don't know" }
    ],
    correctAnswer: "c"
  },
  {
    id: 6,
    type: 'multiple-choice',
    question: "... tasks do you have today?",
    options: [
      { id: "a", text: "How much" },
      { id: "b", text: "When" },
      { id: "c", text: "How many" },
      { id: "d", text: "How" },
      { id: "e", text: "I don't know" }
    ],
    correctAnswer: "c"
  },
  {
    id: 7,
    type: 'multiple-choice',
    question: "I ... at home yesterday, I went to the mountains.",
    options: [
      { id: "a", text: "was" },
      { id: "b", text: "were" },
      { id: "c", text: "wasn't" },
      { id: "d", text: "weren't" },
      { id: "e", text: "I don't know" }
    ],
    correctAnswer: "c"
  },
  {
    id: 8,
    type: 'multiple-choice',
    question: "Have you ever ... to France?",
    options: [
      { id: "a", text: "were" },
      { id: "b", text: "be" },
      { id: "c", text: "been" },
      { id: "d", text: "are" },
      { id: "e", text: "I don't know" }
    ],
    correctAnswer: "c"
  },
  {
    id: 9,
    type: 'multiple-choice',
    question: "You ... take the pills. You have a horrible cough.",
    options: [
      { id: "a", text: "can" },
      { id: "b", text: "could" },
      { id: "c", text: "should" },
      { id: "d", text: "may" },
      { id: "e", text: "I don't know" }
    ],
    correctAnswer: "c"
  },
  {
    id: 10,
    type: 'multiple-choice',
    question: "I would like ... become a designer.",
    options: [
      { id: "a", text: "-" },
      { id: "b", text: "to" },
      { id: "c", text: "for" },
      { id: "d", text: "if" },
      { id: "e", text: "I don't know" }
    ],
    correctAnswer: "b"
  },
  {
    id: 11,
    type: 'multiple-choice',
    question: "My father ... at the factory but he works at the bank now.",
    options: [
      { id: "a", text: "has worked" },
      { id: "b", text: "working" },
      { id: "c", text: "used to work" },
      { id: "d", text: "works" },
      { id: "e", text: "I don't know" }
    ],
    correctAnswer: "c"
  },
  {
    id: 12,
    type: 'multiple-choice',
    question: "I can't eat this food. It's ...",
    options: [
      { id: "a", text: "tasty" },
      { id: "b", text: "mouthwatering" },
      { id: "c", text: "gloomy" },
      { id: "d", text: "raw" },
      { id: "e", text: "I don't know" }
    ],
    correctAnswer: "d"
  },
  {
    id: 13,
    type: 'multiple-choice',
    question: "I need this certificate ... get promoted.",
    options: [
      { id: "a", text: "in order to" },
      { id: "b", text: "so that" },
      { id: "c", text: "to keep" },
      { id: "d", text: "for" },
      { id: "e", text: "I don't know" }
    ],
    correctAnswer: "a"
  },
  {
    id: 14,
    type: 'multiple-choice',
    question: "He isn't experienced ... to do this task.",
    options: [
      { id: "a", text: "too" },
      { id: "b", text: "such" },
      { id: "c", text: "-" },
      { id: "d", text: "enough" },
      { id: "e", text: "I don't know" }
    ],
    correctAnswer: "d"
  },
  {
    id: 15,
    type: 'multiple-choice',
    question: "I will do my work better if I ... from 10 am.",
    options: [
      { id: "a", text: "work" },
      { id: "b", text: "working" },
      { id: "c", text: "worked" },
      { id: "d", text: "would work" },
      { id: "e", text: "I don't know" }
    ],
    correctAnswer: "a"
  },
  {
    id: 16,
    type: 'multiple-choice',
    question: "Вони, можливо, тобі допоможуть.",
    options: [
      { id: "a", text: "They can help you." },
      { id: "b", text: "They maybe help you." },
      { id: "c", text: "They should help you." },
      { id: "d", text: "They may help you." },
      { id: "e", text: "I don't know" }
    ],
    correctAnswer: "d"
  },
  {
    id: 17,
    type: 'multiple-choice',
    question: "Let's ... the problem into smaller tasks",
    options: [
      { id: "a", text: "break up" },
      { id: "b", text: "look after" },
      { id: "c", text: "break down" },
      { id: "d", text: "log in" },
      { id: "e", text: "I don't know" }
    ],
    correctAnswer: "c"
  },
  {
    id: 18,
    type: 'multiple-choice',
    question: "з одного боку..",
    options: [
      { id: "a", text: "from the one hand..." },
      { id: "b", text: "in the one arm..." },
      { id: "c", text: "from the one arm..." },
      { id: "d", text: "on the one hand..." },
      { id: "e", text: "I don't know" }
    ],
    correctAnswer: "d"
  },
  {
    id: 19,
    type: 'multiple-choice',
    question: "Choose the sentence with Passive Voice.",
    options: [
      { id: "a", text: "My dog was sitting on the bench." },
      { id: "b", text: "I was asked not to go there." },
      { id: "c", text: "He was there 5 days ago." },
      { id: "d", text: "My phone was on the table! Who took it?" },
      { id: "e", text: "I don't know" }
    ],
    correctAnswer: "b"
  },
  {
    id: 20,
    type: 'multiple-choice',
    question: "By the time you arrive, I ... all the work.",
    options: [
      { id: "a", text: "will finish" },
      { id: "b", text: "will have finished" },
      { id: "c", text: "finish" },
      { id: "d", text: "have finished" },
      { id: "e", text: "I don't know" }
    ],
    correctAnswer: "b"
  },
  {
    id: 21,
    type: 'multiple-choice',
    question: "I need to ... my schedule for the next week.",
    options: [
      { id: "a", text: "organize" },
      { id: "b", text: "sort" },
      { id: "c", text: "arrange" },
      { id: "d", text: "fix" },
      { id: "e", text: "I don't know" }
    ],
    correctAnswer: "a"
  },
  {
    id: 22,
    type: 'input',
    question: "His __________ (decide) to leave the company surprised everyone in the office.",
    correctAnswer: "decision"
  },
  {
    id: 23,
    type: 'input',
    question: "The researchers were awarded a __________ (recognize) for their work.",
    correctAnswer: "recognition"
  },
  {
    id: 24,
    type: 'input',
    question: "The __________ (succeed) of the event was largely due to the careful planning and hard work of the volunteers.",
    correctAnswer: "success"
  },
  {
    id: 25,
    type: 'input',
    question: "We can __________ (reliable) on our colleague in any situation.",
    correctAnswer: "rely"
  },
  {
    id: 26,
    type: 'input',
    question: "They __________ (contribution) a lot to that fund.",
    correctAnswer: "contributed"
  }
];

export default function Home() {
  const [activeTab, setActiveTab] = useState<string>("student");
  const [currentQuestion, setCurrentQuestion] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [inputAnswers, setInputAnswers] = useState<Record<number, string>>({});
  const [testCompleted, setTestCompleted] = useState<boolean>(false);
  const [testScore, setTestScore] = useState<number>(0);
  const [englishLevel, setEnglishLevel] = useState<string>("");
  const [contactInfo, setContactInfo] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    birthDate: ""
  });
  const [contactSubmitted, setContactSubmitted] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [isCheckingDomain, setIsCheckingDomain] = useState<boolean>(false);

  const currentQuestions = STUDENT_QUESTIONS;

  const handleAnswerSelect = (questionId: number, option: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: option
    }));
  };

  const handleInputAnswer = (questionId: number, value: string) => {
    setInputAnswers(prev => ({
      ...prev,
      [questionId]: value.toLowerCase()
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestion < currentQuestions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      let score = 0;
      currentQuestions.forEach(question => {
        if (question.type === 'input') {
          const userAnswer = inputAnswers[question.id]?.trim() || '';
          const correctAnswer = question.correctAnswer.toLowerCase().trim();
          if (userAnswer === correctAnswer) {
            score++;
          }
        } else if (question.type === 'multiple-choice') {
          if (answers[question.id] === question.correctAnswer) {
            score++;
          }
        }
      });
      
      const percentage = (score / currentQuestions.length) * 100;
      let level = "";
      
      if (percentage >= 90) {
        level = "C1-C2 (Advanced)";
      } else if (percentage >= 70) {
        level = "B2 (Upper Intermediate)";
      } else if (percentage >= 50) {
        level = "B1 (Intermediate)";
      } else if (percentage >= 30) {
        level = "A2 (Pre-Intermediate)";
      } else {
        level = "A1 (Beginner)";
      }
      
      setTestScore(percentage);
      setEnglishLevel(level);
      setTestCompleted(true);
    }
  };

  const handleContactChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setContactInfo({
      ...contactInfo,
      [name]: value
    });

    if (error) {
      setError("");
    }
  };

  const validateEmailDomain = async (email: string): Promise<boolean> => {
    setIsCheckingDomain(true);
    try {
      const response = await fetch('/api/validate-email-domain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      
      if (!data.valid) {
        setError(data.message);
        return false;
      }
      
      return true;
    } catch {
      setError('Помилка перевірки домену електронної пошти');
      return false;
    } finally {
      setIsCheckingDomain(false);
    }
  };
  
  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(contactInfo.email)) {
      setError('Будь ласка, введіть коректну email адресу');
      return;
    }
    
    setIsSubmitting(true);
    const isValidDomain = await validateEmailDomain(contactInfo.email);
    if (!isValidDomain) {
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...contactInfo,
          userType: activeTab,
          englishLevel,
          testScore: Math.round(testScore)
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Помилка при відправці даних');
      }

      setContactSubmitted(true);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Невідома помилка');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetTest = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setInputAnswers({});
    setTestCompleted(false);
    setTestScore(0);
    setEnglishLevel("");
    setContactSubmitted(false);
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setCurrentQuestion(0);
    setAnswers({});
    setInputAnswers({});
    setTestCompleted(false);
    setTestScore(0);
    setEnglishLevel("");
    setContactSubmitted(false);
  };

  const renderQuestion = (question: Question) => {
    if (question.type === 'input') {
      return (
        <input
          type="text"
          value={inputAnswers[question.id] || ""}
          onChange={(e) => handleInputAnswer(question.id, e.target.value)}
          className="w-full p-2 border rounded-md"
          placeholder="Введіть відповідь..."
        />
      );
    } else {
      return (
        <div className="space-y-2">
          {question.options.map((option: Option) => (
            <button
              key={option.id}
              onClick={() => handleAnswerSelect(question.id, option.id)}
              className={`w-full text-left p-3 rounded-md border ${
                answers[question.id] === option.id
                  ? "bg-blue-50 border-blue-500"
                  : "hover:bg-gray-50"
              }`}
            >
              {option.text}
            </button>
          ))}
        </div>
      );
    }
  };

  const currentQuestionData = currentQuestions[currentQuestion];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <header className="bg-white shadow-sm" style={{ borderBottom: '1px solid rgb(251,187,20)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <div className="relative w-8 h-8 mr-2">
              <Image 
                src="/svg/netable.svg" 
                alt="NE TABLE logo" 
                fill 
                className="object-contain"
              />
            </div>
            <h1 className="text-2xl font-bold" style={{ color: 'rgb(6,6,4)' }}>NE TABLE School</h1>
          </div>
          <Button 
            variant="outline" 
            className="border-[rgb(251,187,20)] text-[rgb(6,6,4)] hover:bg-[rgb(251,187,20)] hover:text-[rgb(6,6,4)]" 
            onClick={() => window.location.href = '/login'}
          >
            Увійти
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Визначте свій рівень англійської</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Пройдіть короткий тест, щоб визначити свій рівень англійської мови та отримати індивідуальний план навчання
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Tabs defaultValue="student" value={activeTab} onValueChange={handleTabChange}>
            <TabsList className="grid grid-cols-2 mb-8">
              <TabsTrigger value="student" className="data-[state=active]:bg-[rgb(251,187,20)] data-[state=active]:text-[rgb(6,6,4)]">Я студент</TabsTrigger>
              <TabsTrigger value="teacher" className="data-[state=active]:bg-[rgb(251,187,20)] data-[state=active]:text-[rgb(6,6,4)]">Я викладач</TabsTrigger>
            </TabsList>

            <Card className="border-[rgb(251,187,20)] shadow-sm">
              <CardHeader>
                <CardTitle className="text-[rgb(6,6,4)]">
                  {testCompleted
                    ? "Дякуємо за проходження тесту"
                    : `Питання ${currentQuestion + 1} з ${currentQuestions.length}`}
                </CardTitle>
                <CardDescription>
                  {testCompleted
                    ? "Залиште свої контактні дані, щоб отримати індивідуальний план навчання"
                    : "Оберіть правильну відповідь"}
                </CardDescription>
              </CardHeader>

              <CardContent>
                {!testCompleted ? (
                  <div className="space-y-4">
                    <p className="font-medium text-lg">
                      {currentQuestionData?.question}
                    </p>
                    {currentQuestionData && renderQuestion(currentQuestionData)}
                  </div>
                ) : !contactSubmitted ? (
                  <div className="space-y-6">
                    <p className="text-lg font-medium">Залиште свої контактні дані, щоб ми могли зв&apos;язатися з вами:</p>
                    
                    {error && (
                      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                        {error}
                      </div>
                    )}
                    
                    <form onSubmit={handleContactSubmit} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="firstName">Ім&apos;я</Label>
                          <Input
                            id="firstName"
                            name="firstName"
                            value={contactInfo.firstName}
                            onChange={handleContactChange}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName">Прізвище</Label>
                          <Input
                            id="lastName"
                            name="lastName"
                            value={contactInfo.lastName}
                            onChange={handleContactChange}
                            required
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            value={contactInfo.email}
                            onChange={handleContactChange}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone">Телефон</Label>
                          <Input
                            id="phone"
                            name="phone"
                            type="tel"
                            value={contactInfo.phone}
                            onChange={handleContactChange}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="birthDate">Дата народження</Label>
                        <Input
                          id="birthDate"
                          name="birthDate"
                          type="date"
                          value={contactInfo.birthDate}
                          onChange={handleContactChange}
                          required
                        />
                      </div>
                      <Button 
                        type="submit" 
                        className="w-full bg-[rgb(251,187,20)] text-[rgb(6,6,4)] hover:bg-[rgb(251,187,20)/80]" 
                        disabled={isSubmitting || isCheckingDomain}
                      >
                        {isSubmitting ? "Відправка..." : isCheckingDomain ? "Перевірка домену..." : "Відправити"}
                      </Button>
                    </form>
                  </div>
                ) : (
                  <div className="text-center space-y-4">
                    <div className="rounded-full bg-[rgb(251,187,20)/20] w-16 h-16 flex items-center justify-center mx-auto">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[rgb(251,187,20)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-medium text-[rgb(6,6,4)]">Дякуємо за проходження тесту!</h3>
                    <p className="text-gray-600">
                      Ми зв&apos;яжемося з вами найближчим часом для обговорення програми навчання.
                    </p>
                    <Button onClick={resetTest} variant="outline" className="mt-4 border-[rgb(251,187,20)] text-[rgb(6,6,4)] hover:bg-[rgb(251,187,20)] hover:text-[rgb(6,6,4)]">
                      Пройти тест знову
                    </Button>
                  </div>
                )}
              </CardContent>

              <CardFooter className="flex justify-between">
                {!testCompleted ? (
                  <>
                    <Button 
                      variant="outline" 
                      onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
                      disabled={currentQuestion === 0}
                      className="border-[rgb(251,187,20)] text-[rgb(6,6,4)] hover:bg-[rgb(251,187,20)] hover:text-[rgb(6,6,4)]"
                    >
                      Назад
                    </Button>
                    <Button 
                      onClick={handleNextQuestion}
                      disabled={
                        currentQuestions[currentQuestion].type === 'multiple-choice' 
                          ? !answers[currentQuestions[currentQuestion].id]
                          : !inputAnswers[currentQuestions[currentQuestion].id] || inputAnswers[currentQuestions[currentQuestion].id].trim() === ''
                      }
                      className="bg-[rgb(251,187,20)] text-[rgb(6,6,4)] hover:bg-[rgb(251,187,20)/80]"
                    >
                      {currentQuestion === currentQuestions.length - 1 ? "Завершити" : "Далі"}
                    </Button>
                  </>
                ) : contactSubmitted ? null : (
                  <Button variant="outline" onClick={resetTest} className="ml-auto border-[rgb(251,187,20)] text-[rgb(6,6,4)] hover:bg-[rgb(251,187,20)] hover:text-[rgb(6,6,4)]">
                    Скасувати
                  </Button>
                )}
              </CardFooter>
            </Card>
          </Tabs>
        </div>
      </main>
    </div>
  );
}

