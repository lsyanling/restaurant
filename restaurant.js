//游戏类
function ClassGame() {
    this.Time = 0;
    this.Week = 1;
    this.Day = 1;
    this.Money = 500;
    this.TimeFlag = false;
    this.names = []; //名字集
    this.foodNames = []; //餐食集
    this.chef = []; //餐厅厨师
    this.dining = [0, 0, 0, 0]; //正在用餐
    this.customer = []; //顾客集
    this.queue = []; //排队
    this.headPortrait = []; //头像

    //表示菜在allFood中的索引范围
    this.mainCourse = [3, 5]; //主菜
    this.coldDish = [0, 2]; //凉菜
    this.drink = [6, 8]; //饮料

    //所有菜，便于查找
    this.allFood = [];

    //初始化
    this.Initialize = function() {
        this.Time = 0;
        this.Week = 1;
        this.Day = 1;
        this.Money = 500;
        this.TimeFlag = true;
        this.chef = [];
        this.customer = [];
        this.allFood = [];

        this.names = ['bie', 'weile', 'naisi', 'buhuiba', 'boqi', 'weige', 'baba', 'zhutou', 'html', 'ltsb', '???', 'bb', 'xp', 'wc', 'jj', 'bulai', 'baijiazi', 'kes', 'hao!'];

        this.foodNames = ['fuck baidu', 'sb baidu', 'baidu ml', '爆炒baidu', '清蒸baidu', '凉拌baidu', '可口baidu', '百事baidu', 'baidu快线'];


        CreateCustomer();
        CreateFood();
        BindAllElement();
        AddListener();
        return true;
    };

    //计时停止
    this.TimeStop = function() {
        this.TimeFlag = false;
        return false;
    };

    //计时恢复
    this.TimeResume = function() {
        this.TimeFlag = true;
        return true;
    };

    //数据更新
    this.updateData = function(WEEK, DAY, MONEY) {
        WEEK.textContent = this.Week;
        DAY.textContent = this.Day;
        MONEY.textContent = this.Money;
    }

    //资金变动：厨师工资 入口参数：chef[i]
    this.Salary = function(chef) {
        this.Money -= Math.ceil(chef.weekWorkTime / 7 * chef.salary);
        return true;
    };

    //资金变动：顾客支付 入口参数：customer[i]
    this.Income = function(customer) {
        this.Money += customer.price;
        return true;
    };

    //资金变动：餐食成本 入口参数：customer[i]
    this.Cost = function(customer) {
        for (i in customer.food)
            this.Money -= i.cost;
        return true;
    };

    //资金变动：解雇厨师
    this.Fire = function(chef) {
        this.Salary(chef);
        this.Money -= chef.salary * 7;
        return true;
    };

    //每天事件处理
    this.DayHandling = function() {

        //厨师工作时间
        for (const i in this.chef)
            i.weekWorkTime++;

        //顾客就餐刷新
        for (const i in this.customer)
            i.todayDining = false;

    };

    //每周事件处理
    this.DayHandling = function() {

        //厨师工资
        for (const i in this.chef)
            this.salary(i);

        //厨师工作时间
        for (const i in this.chef) {
            i.allWorkTime += weekWorkTime;
            i = weekWorkTime = 0;
        }

        return true;
    };

    //取名字
    this.GetName = function() {
        this.randomNamesArray();
        if (this.names.length)
            return this.names.pop();
        return false;
    };

    //打乱名字数组
    this.randomNamesArray = function() {
        this.names = this.names.sort(function() { return .5 - Math.random(); })
        return true;
    };

    //招聘厨师
    this.recruitChef = function() {
        if (this.chef.length >= 5)
            return false;
        this.chef.push(new ClassChef(this.randomName, 100));
        return true;
    };

    //解雇厨师 入口参数：第i个厨师
    this.fireChef = function(i) {
        if (i < 0 || i >= 6)
            return false;

        //资金变动
        this.Fire(this.chef[i]);

        //厨师对象初始化
        this.chef[i].weekWorkTime = 0;
        this.chef[i].allWorkTime = 0;

        //sb写法
        this.chef[i] = this.chef[this.chef.length - 1];
        this.chef.pop();

        return true;
    };

    //顾客来到餐厅
    this.customerDinner = function() {

        //事件5秒发生一次
        if (Math.random() * 1000 < 980)
            return false;

        //队列满则顾客不进来
        if (this.queue.length >= 6)
            return false;

        //随机取一未就餐的顾客
        let i = Math.random() * 100;
        i = Math.floor(i);
        i %= this.customer.length;
        while (this.customer[i].todayDining) {
            i = Math.random() * 10;
            i = Math.floor(i);
        }

        //顾客当天就餐设为true
        this.customer[i].todayDining = true;

        //顾客当前位置为队列
        this.customer[i].position = 'queue';

        //顾客入队
        this.queue.push(this.customer[i]);

        console.log("一个客人" + this.queue[this.queue.length - 1].name +
            "进来了");

        /*
        setTimeout(function() {
            newGame.leaveFromQueue2(newGame.queue, newGame.customer[i]);
        }, 40000, newGame.queue, newGame.customer[i])
        */

        return true;
    };

    //顾客从队列离开2 入口参数：队列，顾客对象
    this.leaveFromQueue2 = function(queue, customer) {
        if (customer.position === 'queue') {
            let i = findIndexByValue(queue, customer);
            customer.position = 'out';
            console.log("顾客" + customer.name + "等久了走掉了");
            queue.splice(i, 1);
            return true;
        }
        return false;
    };

    //顾客从队列离开
    this.leaveFromQueue = function() {
        for (let i = 0; i < this.queue.length; i++) {
            //每100ms耐心-1
            this.queue[i].patient -= 1;
            if (this.queue[i].position === 'queue' && this.queue[i].patient <= 0) {
                this.queue[i].position = 'out';
                console.log("顾客" + this.queue[i].name + "等久了走掉了");
                this.queue.splice(i, 1);
                return true;
            }
        }
        return false;
    };

    //顾客就座 出口参数：第i+1个就座的顾客
    this.sitting = function() {

        //队列空点击无效
        if (!this.queue.length)
            return false;

        //座位满则就座失败
        let i = 0;
        let j = 0;
        for (; j < this.dining.length; j++)
            if (this.dining[j] !== 0) {
                i++;
            }
        if (i > 3)
            return false;

        //判断就座位置
        i = 0;
        for (; i < this.dining.length; i++)
            if (this.dining[i] === 0)
                break;
        this.dining[i] = this.queue.shift();

        //顾客位置属性变更
        this.dining[i].position = 'seat';

        //顾客等菜耐心初始化
        this.dining[i].patient = 400;

        console.log("顾客" + this.dining[i].name + "就座于" + (i + 1) + "号位，开始点餐");

        return i + 1;
    }

    //顾客点餐 入口参数：第i个就座的顾客
    this.order = function(i) {

        //决定顾客点菜数目
        let j = Math.random() * 10;
        j = Math.floor(j);

        //最多点3个菜
        j %= 3;
        j++;

        //这个选择是真滴sb
        for (let k = 0; k < j; k++) {
            let m = Math.random() * 100;
            m = Math.floor(m);
            m %= this.allFood.length;

            this.dining[i].food.push(this.allFood[m]);
        }

        //算钱
        for (let n = 0; n < this.dining[i].food.length; n++)
            this.dining[i].price += this.dining[i].food[n].price;

        return true;
    }

    //取消上次点餐 入口参数：第i个就座的顾客
    this.cancelOrder = function(i) {
        let len = this.dining[i].food.length;
        for (let j = 0; j < len; j++)
            this.dining[i].food.pop();
        this.dining[i].price = 0;
        return true;
    }

    //放弃点餐 入口参数：第i个就座的顾客
    this.giveUpOrder = function(i) {
        this.cancelOrder(i);
        this.dining[i] = 0;
        return true;
    }

    //等待上菜 入口参数：第i个就座的顾客
    this.waitingForFood = function(i) {
        setTimeout(this.refuseEat, );
    }

    //放弃这个菜 入口参数：第i个就座的顾客
    this.refuseEat = function(i) {
        let j = 0;
        for (; j < this.dining[i].food.length; j++) {
            if (this.dining[i].food[j] !== 0) {
                cost
            }
        }
    }
}

//厨师类 入口参数：名字，周工资
//厨师属性：名字，周工资，工作状态，总工作时长，当周工作时长
function ClassChef(name, salary) {
    this.name = name;
    this.salary = salary;
    this.workingFlag = 0;
    this.allWorkTime = 0;
    this.weekWorkTime = 0;
}

//顾客类 入口参数：名字，头像
//顾客属性：名字，头像，当日是否就餐，点餐详情，餐食总价，当前位置，耐心
function ClassCustomer(name, headPortrait) {
    this.name = name;
    this.headPortrait = headPortrait;
    this.todayDining = false;
    this.food = [];
    this.price = 0;
    this.position = 'out'; //当前位置
    this.patient = 400; //耐心为40s
}

//餐食类 入口参数：餐食名，餐食类型，成本，价格
//餐食属性：餐食名，餐食类型，成本，价格
function ClassFood(name, type, cost, price) {
    this.name = name;
    this.type = type;
    this.cost = cost;
    this.price = price;
}

//构造游戏对象
let newGame = new ClassGame();

//计时函数
function TimeKeeping(game) {
    if (game.TimeFlag === true) {
        //计时
        game.Time++;

        //随时更新页面计时和资金
        game.updateData(WEEK, DAY, MONEY);

        TIMSMS.textContent = game.Time;

        //顾客来到餐厅
        game.customerDinner()

        //清理队列顾客
        game.leaveFromQueue();
    }
    //一天240s
    if (game.Time >= 2400) {
        game.Day++;
        game.Time = 0;
        //调用每天事件处理函数
        game.DayHandling();
    }
    if (game.Day > 7) {
        game.Week++;
        game.Day = 1;
        //调用每周事件处理函数
        game.WeekHandling();
    }
}

//由数组元素值求索引
function findIndexByValue(list, value) {
    let l = list.length;
    let i = 0;
    for (; i < l; i++) {
        if (list[i] === value)
            return i;
    }
    return false;
}

//迫不得已用死循环来延迟
function sleep(needms) {
    for (let nowTime = Date.now(); Date.now() - nowTime <= needms;);
}

//按按钮初始化游戏
document.getElementById("start-game").addEventListener("click", function() {
    newGame.Initialize();
});

newGame.recruitChef();


//创建顾客对象
function CreateCustomer() {
    for (let i = 0; i < newGame.names.length; i++) {
        newGame.customer.push(new ClassCustomer(newGame.names[i], null));
    }
}

//创建食物对象
function CreateFood() {
    let i = 0;
    for (; i <= newGame.coldDish[1]; i++) {
        newGame.allFood.push(new ClassFood(newGame.foodNames[i], "coldDish", 10, 20));
    }
    for (; i <= newGame.mainCourse[1]; i++) {
        newGame.allFood.push(new ClassFood(newGame.foodNames[i], "mainCourse", 20, 40));
    }
    for (; i <= newGame.drink[1]; i++) {
        newGame.allFood.push(new ClassFood(newGame.foodNames[i], "drink", 5, 10));
    }
}

let WEEK;
let DAY;
let MONEY;
let TIMSMS;
let buttonQueue = [];
let buttonSeat = [];
let FoodMenuCheckbox = [];

//绑定各元素 先绑定文本值，再绑定按钮
function BindAllElement() {

    //绑定WEEK DAY MONEY
    WEEK = document.getElementById("WEEK");
    DAY = document.getElementById("DAY");
    MONEY = document.getElementById("MONEY");

    TIMSMS = document.getElementById("TIMEMS");

    //绑定菜单
    FoodMenuCheckbox = document.querySelectorAll(".food-menu-checkbox");

    //绑定队列按钮
    for (let strNum = 1; strNum <= 6; strNum++) {
        buttonQueue.push(document.getElementById("queue" + strNum));
    }

    //绑定座位按钮
    for (let strNum = 1; strNum <= 4; strNum++) {
        buttonSeat.push(document.getElementById("seat" + strNum));
    }

    return true;
}

function AddListener() {
    //按钮添加监听
    for (let strNum = 0; strNum < 6; strNum++) {
        buttonQueue[strNum].addEventListener("click", function() {

            //确定顾客座位
            let i;

            //就座成功立即进入点餐
            if (i = newGame.sitting()) {

                //判断条件限制，i为1，2，3，4，现给i自减
                i--;


                //按钮变色
                buttonQueue[strNum].style["background-color"] = "red";

                //2秒后按钮恢复颜色
                setTimeout(function() {
                    buttonQueue[strNum].style["background-color"] = "";
                }, 2000);

                //座位变色
                buttonSeat[i].style["background-color"] = "red";

                //计时停止
                newGame.TimeStop();

                //点餐一次
                newGame.order(i)

                //延迟300ms
                sleep(300);

                console.log(newGame.dining[i]);

                //在菜单上打勾
                let j = 0;
                let indexInAllFood;
                for (; j < newGame.dining[i].food.length; j++) {
                    indexInAllFood = findIndexByValue(newGame.allFood, newGame.dining[i].food[j]);
                    sleep(500);
                    FoodMenuCheckbox[indexInAllFood]["checked"] = "checked";

                }
            }
        })
    }
}


//100ms进行一次计时
setInterval(TimeKeeping, 100, newGame);