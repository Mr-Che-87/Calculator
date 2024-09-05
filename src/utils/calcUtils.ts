//Функция для контейнера текущего выражения :
export const calcExpression = (expr: string): number => {
    //разбиение строки на токены
    const tokens = expr.match(/((?<!\d)-?\d+\.?\d*|\+|-|\*|\/|%|√)/g);      //старое - const tokens = expr.match(/(\d+\.?\d*|\+|-|\*|\/|%|√)/g);
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


  
//Функция для контейнера результата:  
export const calcResult = (expression: string): { result: string, expressionWithEqual: string } => {
    try {
      const calculatedResult = calcExpression(expression);
      if (!isNaN(calculatedResult)) {
        return {
          result: calculatedResult.toString(),
          expressionWithEqual: expression + "="
        };
      } else {
        return { result: "Error", expressionWithEqual: "" };
      }
    } catch (error) {
      return { result: "Error", expressionWithEqual: "" };
    }
  };




//Приоритет математических операций (скобочек в макете фигмы нет):
export const mathPriority = (operator: string): number => {
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
  export const applyOperator = (num1: number, num2: number, operator: string): number => {
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
  export const applyPercent = (expression: string): string => {
    const currentNumber = calcExpression(expression);
    const resultWithPercent = currentNumber * 100;
    return resultWithPercent.toString() + "%";
  };

  