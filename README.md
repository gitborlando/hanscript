# 汉简

> 汉简是 Javascript 的中文 DSL, 类似 jsx，面向无编程经验的人，意在降低初学者的上手成本。

## 特点

1. 使用汉字及中文符号系统进行编程， 所谓 “汉”。
2. 简化了 Javascript 的语法以及去除了一些不符合初学者直觉的特性，所谓 “简”。

## 语法

1. 声明变量无需 let，function 等关键字

   ```
   变量1 = 123 // 声明变量
   
   函数1（参数1，参数2）{
   	
   } // 声明函数
   ```

2. 声明一个对象或数组

   ```
   对象1 = （
     属性1 = 123，
     属性2 = ‘456’，
   ）
   
   数组1 = （123，‘456’）
   ```

3. 从一个对象或数组中取一个属性值

   ```
    对象1{‘属性1’} // 123
    
    数组1{2} // ‘456’
    // 这里的‘2’就是指代数组1的第二项，同理， 用‘1’代表第一项而不是‘0’
   ```

4. 循环执行

   ```
   循环（次数 = 1~9）{
   
   }
   // 这个‘次数’即为索引，即次数从 1 到 9 循环执行 9 次，默认步长是 1
   ```

5. 模板字符串

   ```
   名字 = “鲁班”
   价格 = 13888
   
   “《名字》的价格是《价格》” // 鲁班的价格是13888
   // 用双引号来表示一个可以‘扣出来’的字符串，用单引号只能表示普通字符串
   ```

## 其他

1. 汉简可以兼容英文及英文符号系统， 例如：

   ```
   循环（次数 = 1~9）{  等同于  for(i = 1~9){
   
   }                         }
   “《名字》的价格是《价格》” 等同于 "The price of <name> is <price>"
   ```

2. 预编写函数，汉简预定义了一些常用的函数，方便其使用

   ```
   // 向控制台输出
   打印（‘哈喽，卧der’）
   dy（‘哈喽，卧der’）
     
   // 获取数组长度
   数组1 = （123，456，‘789’）
   长度(数组1) // 3
   cd(数组1) // 3
   
   // 四舍五入
   四舍五入（1.5） // 1
   sswr（1.5） // 1
   
   // 求绝对值
   绝对值（-1） // 1
   jdz（-1） // 1
   
   // 交换两个变量的值
   数字1 = 123
   数字2 = 456
   交换（数字1，数字2） // 数字1 === 456，数字2 === 123
   jh（数字1，数字2） // 数字1 === 456，数字2 === 123
   
   // 排序
   数组1 = （123，789，456）
   从小到大（数组1） // （123，456，789）
   cxdd（数组1） // （123，456，789）
   从大到小（数组1） // （789，456，123）
   cddx（数组1） // （789，456，123）
   ```

   

