import { useState, useEffect } from 'react';
import CalculatorDisplay from '../CalculatorDisplay/CalculatorDisplay';
import CalculatorButton from '../CalculatorButton/CalculatorButton';
import { buttonContent } from '../../content/buttonContent';
import styles from './Calculator.module.scss';

import { calcResult, applyPercent } from '../../utils/calcUtils';  

const Calculator: React.FC = () => {
  const [expression, setExpression] = useState<string>('');  //стейт текущего выражения
  const [expressionWithEqual, setExpressionWithEqual] = useState<string>(''); //стейт выражения после клика на "="
  const [result, setResult] = useState<string>(''); //стейт результата
  const [hasCalculated, setHasCalculated] = useState<boolean>(false); //добавил механизм продолжения вычислений с результатом после клика на "="


//Функция для привязки calcResult из util к стейтам:
const processResult = () => {
  const { result, expressionWithEqual } = calcResult(expression);
  setResult(result);
  setExpressionWithEqual(expressionWithEqual);
  setHasCalculated(true);
  setExpression(result); 
};



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
      processResult();
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
      processResult();
    } else if (label === "C" || label === 'Escape') {
      clearExpression();
    } else if (label === "%") {
      const resultWithPercent = applyPercent(expression); 
      setExpression(resultWithPercent);
      setResult(resultWithPercent);
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
