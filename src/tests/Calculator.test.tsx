import { render, screen, fireEvent } from '@testing-library/react';
import Calculator from '../components/Calculator/Calculator';

let testContainer: HTMLElement;
beforeEach(() => {
  const renderResult = render(<Calculator />);
  testContainer = renderResult.container;
});

//тест инициализации:
  describe('Calculator Component', () => {
    it('should renders calculator', () => {
      expect(screen.getByText('0')).toBeInTheDocument();
    });
  });

//обобщенный тест работы кнопок:  
  describe('Button Clicks', () => {
    it.each([
      '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'
    ])('should handle button click for %s', (number) => {
      fireEvent.click(screen.getByText(number));
      expect(screen.getByText(number)).toBeInTheDocument();
    });
  });


//Тесты простейших матем-операций:
  describe('Basic Math Operations', () => {
    it('should calc subtraction', () => {
      fireEvent.click(screen.getByText('4'));
      fireEvent.click(screen.getByText('-'));
      fireEvent.click(screen.getByText('2'));
      fireEvent.click(screen.getByText('='));
      const resultDisplay = testContainer.querySelector('.displayResult');
      expect(resultDisplay).toHaveTextContent(/^2$/); //проверка точного совпадения текста
    });

    it.each([
      [1, 2, 3],
      [23, 41, 64],
      [-5, 4, -1],
    ])('should calc addition %i + %i = %i', (a, b, expected) => {
      fireEvent.click(screen.getByText(a.toString()));
      fireEvent.click(screen.getByText('+'));
      fireEvent.click(screen.getByText(b.toString()));
      fireEvent.click(screen.getByText('='));
      //более точный тест: "2" ищем не во всём dom-дереве, а конкретно в блоке результата(по классу):
      const resultDisplay = testContainer.querySelector('.displayResult');
      expect(resultDisplay).toHaveTextContent(expected.toString());
    });

    //в одном тесте - несколько комбинаций
    it.each([
      [3, 4, 12],
      [10, 0.1, 1],
      [8, -5, -40],
    ])('should calcul multiply %i * %i = %i', (a, b, expected) => {
      fireEvent.click(screen.getByText(a.toString()));
      fireEvent.click(screen.getByText('*'));
      fireEvent.click(screen.getByText(b.toString()));
      fireEvent.click(screen.getByText('='));
      const resultDisplay = testContainer.querySelector('.displayResult');
      expect(resultDisplay).toHaveTextContent(expected.toString());
    });

    //квадратный корень:
    it('should calc sqrt', () => {
      fireEvent.click(screen.getByText('9'));
      fireEvent.click(screen.getByText('√'));
      fireEvent.click(screen.getByText('='));
      const resultDisplay = testContainer.querySelector('.displayResult');
      expect(resultDisplay).toHaveTextContent(/^3$/);
    });

    //проценты:
    it('should calc percent', () => {
      fireEvent.click(screen.getByText('0.5'));
      fireEvent.click(screen.getByText('%'));
      const resultDisplay = testContainer.querySelector('.displayResult');
      expect(resultDisplay).toHaveTextContent(/^50%$/);
    });
  });


//Корнер-кейс  - деление на ноль:
  describe('Corner Case: Division By Zero', () => {    
     it('should calc division by zero', () => {
      fireEvent.click(screen.getByText('7'));
      fireEvent.click(screen.getByText('/'));
      fireEvent.click(screen.getByText('0'));
      fireEvent.click(screen.getByText('='));
      const resultDisplay = testContainer.querySelector('.displayResult');
      expect(resultDisplay).toHaveTextContent('Infinity');
    });
  });


//Работоспособность клавиатуры:
  describe('Keyboard Input', () => {
    it('should handle keyboard input', () => {
      fireEvent.keyDown(screen.getByRole('textbox'), { key: '1', code: 'Digit1', charCode: 49 });
      fireEvent.keyDown(screen.getByRole('textbox'), { key: '+', code: 'Key+', charCode: 43 });
      fireEvent.keyDown(screen.getByRole('textbox'), { key: '2', code: 'Digit2', charCode: 50 });
      fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Enter', code: 'Enter', charCode: 13 });
      const resultDisplay = testContainer.querySelector('.displayResult');
      expect(resultDisplay).toHaveTextContent(/^3$/);
    });
  });


//Обновление дисплея ввода после каждой операции и приоритет матем-операций:
  describe('Display Update and Operation Priority', () => {
    const performOperations = () => {
      fireEvent.click(screen.getByText('1'));
      fireEvent.click(screen.getByText('+'));
      fireEvent.click(screen.getByText('2'));
      fireEvent.click(screen.getByText('*'));
      fireEvent.click(screen.getByText('30'));
    };

    it('should update display', () => {
      performOperations();
      const displayCurrent = testContainer.querySelector('.displayCurrent');
      expect(displayCurrent).toHaveTextContent('1+2*30');
    });
  
    it('should handle math priority', () => {
      performOperations();
      fireEvent.click(screen.getByText('='));
      const resultDisplay = testContainer.querySelector('.displayResult');
      expect(resultDisplay).toHaveTextContent(/^61$/);
    });
  });


//Проверка использования результатов предыдущих вычислений:
  describe('Using  prev.results', () => {
    it('should use prev.results in new calc', () => {
      fireEvent.click(screen.getByText('4'));
      fireEvent.click(screen.getByText('+'));
      fireEvent.click(screen.getByText('1'));
      fireEvent.click(screen.getByText('='));
      fireEvent.click(screen.getByText('/'));
      fireEvent.click(screen.getByText('2'));
      fireEvent.click(screen.getByText('='));
      const resultDisplay = testContainer.querySelector('.displayResult');
      expect(resultDisplay).toHaveTextContent(/^2.5$/);
    });
  });


//Backspace и Escape:
  describe('Escape and Backspace', () => {
    const performOperations = () => { 
      fireEvent.click(screen.getByText('5'));
      fireEvent.click(screen.getByText('-'));
      fireEvent.click(screen.getByText('1'));
    }

    it('should handle Backspace', () => {
      performOperations();
      const displayCurrent = testContainer.querySelector('.displayCurrent');
      expect(displayCurrent).toHaveTextContent(/^5-1$/);

      fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Backspace', code: 'Backspace', charCode: 8 });
      expect(displayCurrent).toHaveTextContent(/^5-$/);
    });

    it('should handle Escape ', () => {
      performOperations();
      const displayCurrent = testContainer.querySelector('.displayCurrent');
      const resultDisplay = testContainer.querySelector('.displayResult');

      fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Escape', code: 'Escape', charCode: 27 });
       expect(displayCurrent).toHaveTextContent(/^0$/);
       expect(resultDisplay).toHaveTextContent(/^0$/);
  });
});



/*
//СТАРОЕ:
import { render, screen, fireEvent } from '@testing-library/react';  
import Calculator from '../components/Calculator/Calculator';

let testContainer: HTMLElement;
beforeEach(() => {
  const renderResult = render(<Calculator />);
  testContainer = renderResult.container;
});


//тест инициализации:
test('renders calculator', () => {  
  expect(screen.getByText('0')).toBeInTheDocument();  
});

//обобщенный тест работы кнопок:
test.each([
  '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'
])('handle button click for %s', (number) => {  
  fireEvent.click(screen.getByText(number));  
  expect(screen.getByText(number)).toBeInTheDocument();  
});



//Тесты простейших матем-операций:
test('calc subtraction', () => {  
  fireEvent.click(screen.getByText('4'));
  fireEvent.click(screen.getByText('-'));
  fireEvent.click(screen.getByText('2'));
  fireEvent.click(screen.getByText('='));
//более точный тест: "2" ищем не во всём dom-дереве, а конкретно в блоке результата(по классу):
  const resultDisplay = testContainer.querySelector('.displayResult'); 
  expect(resultDisplay).toHaveTextContent('2'); 
});

//в одном тесте - несколько комбинаций
test.each([
  [1, 2, 3],
  [23, 41, 64],
  [-5, 4, -1],
])('calc addition %i + %i = %i', (a, b, expected) => {
  fireEvent.click(screen.getByText(a.toString()));
  fireEvent.click(screen.getByText('+'));
  fireEvent.click(screen.getByText(b.toString()));
  fireEvent.click(screen.getByText('='));
  const resultDisplay = testContainer.querySelector('.displayResult');
  expect(resultDisplay).toHaveTextContent(expected.toString());
});

test.each([
  [3, 4, 12],
  [10, 0.1, 1],
  [8, -5, -40],
])('calc multiplication %i * %i = %i', (a, b, expected) => {
  fireEvent.click(screen.getByText(a.toString()));
  fireEvent.click(screen.getByText('*'));
  fireEvent.click(screen.getByText(b.toString()));
  fireEvent.click(screen.getByText('='));
  const resultDisplay = testContainer.querySelector('.displayResult');
  expect(resultDisplay).toHaveTextContent(expected.toString());
});

//квадратный корень:
test('calc sqrt', () => {
  fireEvent.click(screen.getByText('9'));
  fireEvent.click(screen.getByText('√'));
  fireEvent.click(screen.getByText('='));
  const resultDisplay = testContainer.querySelector('.displayResult');
  expect(resultDisplay).toHaveTextContent('3');
});

//проценты:
test('calc percent', () => {
  fireEvent.click(screen.getByText('0.5'));
  fireEvent.click(screen.getByText('%'));
  const resultDisplay = testContainer.querySelector('.displayResult');
  expect(resultDisplay).toHaveTextContent('50%'); 
});


//Деление на ноль:
test('calc division by zero', () => {
  fireEvent.click(screen.getByText('7'));
  fireEvent.click(screen.getByText('/'));
  fireEvent.click(screen.getByText('0'));
  fireEvent.click(screen.getByText('='));
  const resultDisplay = testContainer.querySelector('.displayResult');
  expect(resultDisplay).toHaveTextContent('Infinity'); 
});




//Работоспособность клавиатуры:
test('handle keyboard input', () => {
  fireEvent.keyDown(screen.getByRole('textbox'), { key: '1', code: 'Digit1', charCode: 49 });
  fireEvent.keyDown(screen.getByRole('textbox'), { key: '+', code: 'Key+', charCode: 43 });
  fireEvent.keyDown(screen.getByRole('textbox'), { key: '2', code: 'Digit2', charCode: 50 });
  fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Enter', code: 'Enter', charCode: 13 });
  const resultDisplay = testContainer.querySelector('.displayResult');
  expect(resultDisplay).toHaveTextContent('3');
});




//Обновление дисплея ввода после каждой операции и приоритет матем-операций:
//обьединил 2 в 1 для демонстрации что так технически можно, но лучше так не делать(для изолированности тестов)
test('updates displayCurrent and math.priority', () => {
  fireEvent.click(screen.getByText('1'));
  fireEvent.click(screen.getByText('+'));
  fireEvent.click(screen.getByText('2'));
  fireEvent.click(screen.getByText('*'));
  fireEvent.click(screen.getByText('30'));
  const displayCurrent = testContainer.querySelector('.displayCurrent');
  expect(displayCurrent).toHaveTextContent('1+2*30');

  fireEvent.click(screen.getByText('='));
  const resultDisplay = testContainer.querySelector('.displayResult');
  expect(resultDisplay).toHaveTextContent('61');
});


//Проверка использования результатов предыдущих вычислений:
test('use prev.results in new calc', () => {
  fireEvent.click(screen.getByText('4'));
  fireEvent.click(screen.getByText('+'));
  fireEvent.click(screen.getByText('1'));
  fireEvent.click(screen.getByText('='));
  fireEvent.click(screen.getByText('/'));
  fireEvent.click(screen.getByText('2'));
  fireEvent.click(screen.getByText('='));
  const resultDisplay = testContainer.querySelector('.displayResult');
  expect(resultDisplay).toHaveTextContent('2.5');
});




//Escape и Backspace:
//обьединил 2 в 1 для демонстрации что так технически можно, но лучше так не делать(для изолированности тестов)
test('handle Escape and Backspace', () => {
  fireEvent.click(screen.getByText('5'));
  fireEvent.click(screen.getByText('-'));
  fireEvent.click(screen.getByText('1'));
  const displayCurrent = testContainer.querySelector('.displayCurrent');
  expect(displayCurrent).toHaveTextContent('5-1');

  //тест Backspace
  fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Backspace', code: 'Backspace', charCode: 8 });
  expect(displayCurrent).toHaveTextContent('5-');

  //тест Escape
  fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Escape', code: 'Escape', charCode: 27 });
  expect(displayCurrent).toHaveTextContent('0');  
  const resultDisplay = testContainer.querySelector('.displayResult');
  expect(resultDisplay).toHaveTextContent('0');  
});
*/
