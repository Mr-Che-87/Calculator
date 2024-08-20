import { useState, useEffect } from 'react';
import CalculatorDisplay from '../CalculatorDisplay/CalculatorDisplay';
import CalculatorButton from '../CalculatorButton/CalculatorButton';
import { buttonContent } from '../../content/buttonContent';
import styles from './Calculator.module.scss';

const Calculator: React.FC = () => {
  const [expression, setExpression] = useState<string>('');  //стейт текущего выражения
  const [expressionWithEqual, setExpressionWithEqual] = useState<string>(''); //стейт выражения после клика на "="
  const [result, setResult] = useState<string>(''); //стейт результата
  const [hasCalculated, setHasCalculated] = useState<boolean>(false); //добавил механизм продолжения вычислений с результатом после клика на "="

 //Хэндлер на клавиатуру:
 useEffect(() => {
  const handleKeyDown = (event: KeyboardEvent) => {
    const allowedKeys = /[0-9+\-*/%√.,]/;
    const isAllowedKey = allowedKeys.test(event.key);
    
    if (event.key.startsWith('F') && event.key.length > 1) {
      return;  //игнор клавиш F1-F12:
    } else if (event.key === ' ') {
      event.preventDefault(); //игнор пробела
    } else if (!isAllowedKey && event.key !== 'Escape' && event.key !== 'Enter' && event.key !== 'Backspace') {
      event.preventDefault(); //блокировать другие клавиши от добавления в expression
    } else if (event.key === 'Escape') {
      clearExpression();
    } else if (event.key === 'Enter') {
      calcResult();
    } else if (event.key === 'Backspace') {
      handleBackspace();
    } else if (isAllowedKey) {
      handleButtonClick(event.key);
    }
  };

  window.addEventListener('keydown', handleKeyDown);
  return () => {
    window.removeEventListener('keydown', handleKeyDown);
  };
}, [expression]);


  //Хэндлер на кнопки:
  const handleButtonClick = (label: string) => {
    if (label === "×") label = "*";
      
    if (label === " ") { //игнорировать пробел
      return;
    }
    if (label === "," || label === ".") { //запятая и точка - один функционал
      label = ".";
    }
    if (label === "=" || label === 'Enter') {
      calcResult();
    } else if (label === "C" || label === 'Escape') {
      clearExpression();
    } else if (label === "%") {
      applyPercent();
    } else {
      //Если предыдущее выражение завершилось вычислением, и начато новое...
      if (hasCalculated && /[+\-*/√]/.test(label)) {
        setExpression(result + label); //продолжить вычисления с результатом
        setExpressionWithEqual(""); //на дисплее сбрасываем прошлое выражение с "="
        setHasCalculated(false);
      } else {
        //"." в начале числа интерпретируется как "0.":
        if (label === "." && (expression === "" || /[+\-*/√]$/.test(expression))) {
          label = "0.";
        }
        //Если предыдущее действие было равно, заменяем выражение на результат:
        if (hasCalculated) {
          setExpression(label);
          setExpressionWithEqual(""); //сбрасываем прошлое выражение с "="
          setHasCalculated(false);
        } else {
          setExpression((prevExpression) => prevExpression + label);
        }
      }
    }
  };
  
  //Функция для контейнера результата:
  const calcResult = () => {
    try {
      const calculatedResult = calcExpression(expression);
      if (!isNaN(calculatedResult)) {
        setResult(calculatedResult.toString());
        setExpressionWithEqual(expression + "="); //сохраняем выражение с "="
        setHasCalculated(true); //продолжения вычислений с результатом
        setExpression(calculatedResult.toString());  
      } else {
        setResult("Error");
      }
    } catch (error) {
      setResult("Error");
    }
  };
  
 //Функция для контейнера текущего выражения :
  const calcExpression = (expr: string): number => {
    //разбиение строки на токены
    const tokens = expr.match(/(\d+\.?\d*|\+|-|\*|\/|%|√)/g);
    if (!tokens) throw new Error("Invalid expression");

    //два стека: один для чисел, другой для операторов
    const resultStack: number[] = [];
    const operatorStack: string[] = [];

    //проход по каждому токену (числу или оператору)
    tokens.forEach((token) => {
      if (!isNaN(Number(token))) {
        //если токен — число, кладём его в стек чисел:
        resultStack.push(Number(token));
      } else {
        //если токен — оператор, обрабатываем его:
        while (
          operatorStack.length &&
          mathPriority(operatorStack[operatorStack.length - 1]) >= mathPriority(token)
        ) {
          //Выполняем предыдущий оператор, если он имеет равный или более высокий приоритет
          const operator = operatorStack.pop();
          const num2 = resultStack.pop();
          const num1 = resultStack.pop();
          resultStack.push(applyOperator(num1!, num2!, operator!));
        }
        //кладём текущий оператор в стек
        operatorStack.push(token);
      }
    });

    //выполняем оставшиеся операции в стеке операторов
    while (operatorStack.length) {
      const operator = operatorStack.pop();
      const num2 = resultStack.pop();
      const num1 = resultStack.pop();
      resultStack.push(applyOperator(num1!, num2!, operator!));
    }
      // Округляем результат до 15 знаков после запятой
      return parseFloat(resultStack[0].toPrecision(15)) || 0;
  };

  //Приоритет математических операций (скобочек в макете фигмы нет):
  const mathPriority = (operator: string): number => {
    switch (operator) {
      case "+":
      case "-":
        return 1;
      case "*":
      case "/":
      case "%":
        return 2;
      case "√":
        return 3;
      default:
        return 0;
    }
  };



  //Непосредственно само вычисление:
  const applyOperator = (num1: number, num2: number, operator: string): number => {
    switch (operator) {
      case "+":
        return num1 + num2;
      case "-":
        return num1 - num2;
      case "*":
        return num1 * num2;
      case "/":
        return num1 / num2;
      case "%":
        return num1 % num2;
      case "√":
        return Math.sqrt(num2); 
      default:
        throw new Error("Unsupported operator");
    }
  };

  //клик на "%" приравнивается к "=":
  const applyPercent = () => {
      const currentNumber = calcExpression(expression);
      const resultWithPercent = currentNumber * 100;
      setExpression(resultWithPercent.toString() + "%");
      setResult(resultWithPercent.toString() + "%");
  };

  //Хэндлер чтоб стереть последний введённый символ (кнопки в фигме нет, сделал с клавиатуры):
  const handleBackspace = () => {
    if (expression.length > 0) {
      setExpression(expression.slice(0, -1));
    }
  };

  //Хэндлер чтоб стереть всё 
  const clearExpression = () => {
    setExpression("");
    setExpressionWithEqual("");
    setResult("");
        setHasCalculated(false);
  };


  
  return (
    <div className={styles.calculatorContainer}>
      <div className={styles.contentContainer}>
        
        <CalculatorDisplay 
          expression={expression} 
          expressionWithEqual={expressionWithEqual}
          result={result} />
        
        <hr className={styles.separator} />
        
        <div className={styles.buttonGrid}>
        {buttonContent.map((button) => (
            <CalculatorButton 
              key={button.label} 
              label={button.display || button.label} 
              onClick={handleButtonClick} 
              id={button.id} 
            />
          ))}
        </div>
        
      </div>
    </div>
  );
};

export default Calculator;
