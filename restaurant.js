"use strict";
//游戏类
class ClassGame {
    constructor() {
        this.Time = 0;
        this.Week = 1;
        this.Day = 1;
        this.Money = 500;
        this.TimeFlag = false;

        //顾客名字集
        this.names = ['bie', 'weile', 'naisi', 'buhuiba', 'boqi', 'weige', 'baba', 'zhutou', 'html', 'ltsb', '???', 'bb', 'xp', 'wc', 'jj', 'bulai', 'baijiazi', 'kes', 'hao!', 'bie1', 'weile1', 'naisi1', 'buhuiba1', 'boqi1', 'weige1', 'baba1', 'zhutou1', 'html1', 'ltsb1', '???1', 'bb1', 'hao!1'];
        //厨师名字集
        this.chefNames = ['xp1', 'wc1', 'jj1', 'bulai1', 'baijiazi1', 'kes1'];
        //餐食名集
        this.foodNames = ['fuck baidu', 'sb baidu', 'baidu ml', '爆炒baidu', '清蒸baidu', '凉拌baidu', '可口baidu', '百事baidu', 'baidu快线'];

        this.allChef = []; //所有厨师对象集
        this.chef = []; //餐厅厨师
        this.dining = [0, 0, 0, 0]; //正在用餐
        this.customer = []; //所有顾客对象集
        this.queue = []; //排队
        this.headPortrait = []; //头像

        //表示菜在allFood中的索引范围
        this.mainCourse = [3, 5]; //主菜
        this.coldDish = [0, 2]; //凉菜
        this.drink = [6, 8]; //饮料

        //所有菜，便于查找
        this.allFood = [];

        //做好的菜
        this.readyFood = [];
    }

    //初始化
    Initialize() {

        this.TimeFlag = true;

        CreateChef();
        CreateCustomer();
        CreateFood();
        BindAllElement();
        AddListener();

        this.recruitChef();
        return true;
    };

    //计时停止
    TimeStop() {
        this.TimeFlag = false;
        return false;
    };

    //计时恢复
    TimeResume() {
        this.TimeFlag = true;
        return true;
    };

    //数据更新
    updateData(WEEK, DAY, MONEY) {
        WEEK.textContent = this.Week;
        DAY.textContent = this.Day;
        MONEY.textContent = this.Money;
    }

    //点餐情况更新
    updateOrder(orderName, orderPrice) {
        orderName.textContent = this.dining[orderCalculateToOrderFinish].name;
        orderPrice.textContent = this.dining[orderCalculateToOrderFinish].price;
    }

    //按钮颜色管理
    buttonColor() {
        let i = 0;
        for (i = 0; i < this.dining.length; i++) {
            if (this.dining[i]) {
                //座位变色
                buttonSeat[i].style["background-color"] = "red";
            } else {
                //座位恢复颜色
                buttonSeat[i].style["background-color"] = "";
            }
        }
    }

    //资金变动：厨师工资 入口参数：厨师对象
    Salary(chef) {
        this.Money -= Math.ceil(chef.weekWorkTime / 7 * chef.salary);
        return true;
    };

    //资金变动：顾客支付 入口参数：顾客对象
    Income(customer) {
        this.Money += customer.price;
        return true;
    };

    //资金变动：餐食成本 入口参数：顾客对象
    Cost(customer) {
        for (i in customer.food)
            this.Money -= i.cost;
        return true;
    };

    //资金变动：解雇厨师
    Fire(chef) {
        if (this.Money < Math.ceil(chef.weekWorkTime / 7 * chef.salary) + chef.salary * 7)
            return false;
        this.Salary(chef);
        this.Money -= chef.salary * 7;
        return true;
    };

    //每天事件处理
    DayHandling() {

        //厨师工作时间
        for (let i = 0; i < this.chef.length; i++)
            this.chef[i].weekWorkTime++;

        //顾客就餐刷新
        for (let i = 0; i < this.customer.length; i++)
            this.customer[i].todayDining = false;

    };

    //每周事件处理
    WeekHandling() {

        //厨师工资
        for (let i = 0; i < this.chef.length; i++)
            this.Salary(this.chef[i]);

        //厨师工作时间
        for (let i = 0; i < this.chef.length; i++) {
            this.chef[i].allWorkTime += this.chef[i].weekWorkTime;
            this.chef[i].weekWorkTime = 0;
        }

        return true;
    };

    //取名字
    GetName() {
        if (this.names.length)
            return this.names.pop();
        return false;
    };

    //招聘厨师
    recruitChef() {
        if (this.chef.length === 6)
            return false;
        this.chef.push(this.allChef[0]);
        this.allChef.shift();
        return true;
    };

    //解雇厨师
    fireChef() {
        //不能一个也没有啊
        if (this.chef.length === 1)
            return false;

        if (!this.Fire(this.chef[this.chef.length - 1]))
            return false;

        //资金变动
        this.Fire(this.chef[this.chef.length - 1]);

        //厨师对象初始化
        this.chef[this.chef.length - 1].weekWorkTime = 0;
        this.chef[this.chef.length - 1].allWorkTime = 0;

        this.allChef.push(this.chef[this.chef.length - 1]);
        this.chef.splice(this.chef.length - 1, 1);

        return true;
    };

    //顾客来到餐厅
    customerComeToRestaurant() {

        //事件发生概率20%
        if ((Math.random() * 100) > 20)
            return false;

        //随机取一未就餐的顾客
        let i = Math.random() * 100;
        i = Math.floor(i);
        i %= this.customer.length;

        if (this.customer[i].todayDining)
            return false;

        if (this.customer[i].position !== 'out')
            return false;

        //顾客当天就餐设为true
        this.customer[i].todayDining = true;

        //队列满则顾客不进来
        if (this.queue.length >= 6)
            return false;

        //顾客位置变更为队列
        this.customer[i].position = 'queue';

        //顾客入队
        this.queue.push(this.customer[i]);

        console.log("一个客人" + this.queue[this.queue.length - 1].name +
            "进来了");

        return true;
    };

    //顾客从队列离开
    leaveFromQueue() {
        for (let i = 0; i < this.queue.length; i++) {
            //耐心-1
            this.queue[i].patient -= 1;

            //耐心为0
            if (this.queue[i].position === 'queue' && this.queue[i].patient === 0) {

                //顾客位置变更
                this.queue[i].position = 'out';
                console.log("顾客" + this.queue[i].name + "等久了走掉了");
                this.queue.splice(i, 1);
                return true;
            }
        }
        return false;
    };

    //顾客就座 出口参数：第i+1个就座的顾客
    sitting() {

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
        this.dining[i].patient = 40;

        console.log("顾客" + this.dining[i].name + "就座于" + (i + 1) + "号位，开始点餐");

        return i + 1;
    }

    //顾客点餐 入口参数：第i个就座的顾客
    order(i) {

        //决定顾客点菜数目
        let j = Math.random() * 10;
        j = Math.floor(j);

        //最多点3个菜
        j %= 3;
        if (j <= 2)
            j++;

        //这个选择是真滴sb
        for (let k = 0; k < j; k++) {
            let m = Math.random() * 100;
            m = Math.floor(m);
            m %= this.allFood.length;

            //如果这个菜点过了
            if (typeof(findIndexByValue(this.dining[i].food, this.allFood[m])) !== 'boolean') {
                //重来
                k--;
                continue;
            }

            this.dining[i].food.push(this.allFood[m]);

        }

        //算钱
        for (let n = 0; n < this.dining[i].food.length; n++)
            this.dining[i].price += this.dining[i].food[n].price;

        return true;
    }

    //放弃点餐，清空座位 入口参数：第i个座位，顾客对象
    giveUpOrder(i, customer) {
        this.freeCustomer(customer);
        this.dining[i] = 0;
        return true;
    }

    //顾客刷新 入口参数：顾客对象
    freeCustomer(customer) {
        customer.food = [];
        customer.price = 0;
        customer.position = 'out'; //当前位置
        customer.patient = 40; //耐心为40s
    }

    //不吃了的菜
    refuseEat() {
        let i = 0;
        for (; i < this.dining.length; i++) {

            //有人
            if (this.dining[i]) {

                //耐心减少
                if (this.dining[i].position === "seat") {
                    this.dining[i].patient -= 1;
                    if (this.dining[i].patient <= 0) {
                        //没人要
                        if (this.dining[i].food.length) {
                            this.dining[i].food[0].whose[i] = 'none';

                            //不付钱
                            this.dining[i].price -= this.dining[i].food[0].price;
                            this.dining[i].food.shift();
                        }

                        //生气
                        if (!this.dining[i].food.length && !this.dining[i].haveEat) {
                            this.dining[i].position = 'angry';
                            return true;
                        }

                        //重置耐心
                        switch (this.dining[i].food[0].type) {
                            case 'coldDish':
                                {
                                    this.dining[i].patient = 30;
                                    break;
                                }
                            case 'mainCourse':
                                {
                                    this.dining[i].patient = 40;
                                    break;
                                }
                            case 'drink':
                                {
                                    this.dining[i].patient = 25;
                                    break;
                                }
                            default:
                                break;
                        }


                    }
                }
            }
        }
    }

    //安抚生气 入口参数：顾客对象，第i个座位
    appeaseAngry(customer, i) {
        if (this.dining[i] && this.dining[i].position === 'angry') {

            //设置顾客状态
            this.dining[i].position = 'out';
            this.patient = 40;
            this.eatSpeed = 20;
            this.haveEat = false;
            this.lastEat = 0;

            //清空座位
            this.dining[i] = 0;

            console.log(customer.name + "气坏了但走了");
        }
    }

    //开始做菜
    cookListDish() {
        let i = 0;
        //第几个顾客耐心最小
        let minPatient = 100;
        let minPatientIndex = 'none';

        //是否有空闲的厨师
        let freeChef = false;
        let freeChefIndex = false;
        for (i = 0; i < this.chef.length; i++) {
            if (this.chef[i].position === 'free') {
                freeChef = true;
                freeChefIndex = i;
                break;
            }
        }

        //没有空闲的厨师
        if (!freeChef)
            return false;

        //有空闲的厨师，看哪个菜紧急
        for (i = 0; i < this.dining.length; i++) {
            //座位上有人
            if (this.dining[i]) {
                //在等菜
                if (this.dining[i].position === 'seat') {
                    console.log(this.dining[i]);
                    //等的菜已经在做了
                    if (this.dining[i].food.length && this.dining[i].food[0].position[i] === 'ing') {
                        continue;

                    }

                    //知道谁在等菜了，跳出去
                    if (this.dining[i].patient < minPatient) {
                        minPatientIndex = [i, 0];
                        break;
                    }
                }
            }
        }

        //如果都在吃或者等的菜都在做，不能让厨师闲着
        if (minPatientIndex === 'none') {
            for (i = 0; i < this.dining.length; i++) {
                //座位上有人
                if (this.dining[i]) {
                    if (this.dining[i].position === 'seat' && this.dining[i].food.length >= 2) {
                        if (this.dining[i].food[1].position[i] === 'ing')
                            continue;
                        minPatientIndex = [i, 1];
                        //知道谁有菜没在做了，跳出去
                        break;
                    }
                }
            }
        }

        //那没办法了，下次再说
        if (minPatientIndex === 'none')
            return false;

        //扣除成本
        this.Money -= this.dining[i].food[minPatientIndex[1]].cost;

        //安排厨师做菜
        this.chef[freeChefIndex].position = 'busy';

        //设置菜的归属
        this.dining[i].food[minPatientIndex[1]].whose[i] = this.dining[i];

        //设置菜的状态
        this.dining[i].food[minPatientIndex[1]].position[i] = 'ing';

        //设置谁在做这个菜
        this.dining[i].food[minPatientIndex[1]].theChef[i] = this.chef[freeChefIndex];
        this.chef[freeChefIndex].cookingDish = [this.dining[i].food[minPatientIndex[1]], this.dining[i]];

        //根据菜的类型设置做菜时间
        switch (this.dining[i].food[minPatientIndex[1]].type) {
            case 'coldDish':
                {
                    this.dining[i].food[minPatientIndex[1]].needTime[i] = 10;
                    break;
                }
            case 'mainCourse':
                {
                    this.dining[i].food[minPatientIndex[1]].needTime[i] = 15;
                    break
                }
            case 'drink':
                {
                    this.dining[i].food[minPatientIndex[1]].needTime[i] = 5;
                    break;
                }
            default:
                break;
        }
        return true;
    }

    //菜做好
    foodWell() {
        let i = 0;
        let j = 0;
        for (i = 0; i < this.chef.length; i++) {
            for (j = 0; j < this.dining.length; j++) {
                //厨师在工作
                if (this.chef[i].position === 'busy') {
                    //某顾客的这个菜正在做
                    if (this.chef[i].cookingDish[0].position[j] === 'ing') {
                        this.chef[i].cookingDish[0].needTime[j] -= 1;
                        //做好了
                        if (this.chef[i].cookingDish[0].needTime[j] === 0) {

                            //变更菜的状态
                            this.chef[i].cookingDish[0].position[j] = 'ed';

                            //变更对应厨师的状态
                            this.chef[i].position = 'complete';

                            //设置菜的耐久
                            switch (this.chef[i].cookingDish[0].type) {
                                case 'coldDish':
                                    {
                                        this.chef[i].cookingDish[0].durability[j] = 30;
                                        break;
                                    }
                                case 'mainCourse':
                                    {
                                        this.chef[i].cookingDish[0].durability[j] = 30;
                                        break
                                    }
                                case 'drink':
                                    {
                                        this.chef[i].cookingDish[0].durability[j] = 25;
                                        break;
                                    }
                                default:
                                    break;
                            }

                            //将菜送入ready数组
                            this.readyFood.push(this.chef[i].cookingDish[0]);
                        }
                    }
                }
            }
        }
    }

    //加速做菜和上菜 入口参数：厨师对象
    dishUp(chef) {

        //点击厨师加速做菜
        if (chef.position === 'busy') {
            chef.cookingDish[0].needTime -= 1;
            return true;
        }

        //如果菜做好了
        if (chef.position === 'complete') {

            //设置餐食状态
            chef.cookingDish[0].position = 'eating';

            //设置顾客状态
            chef.cookingDish[1].position = 'eating';
            chef.cookingDish[1].haveEat = true;
            chef.cookingDish[1].lastEat = chef.cookingDish[0];

            //根据菜的类型设置吃菜速度
            switch (chef.cookingDish[0].type) {
                case 'coldDish':
                    {
                        chef.cookingDish[1].eatSpeed = 10;
                        break;
                    }
                case 'mainCourse':
                    {
                        chef.cookingDish[1].eatSpeed = 20;
                        break
                    }
                case 'drink':
                    {
                        chef.cookingDish[1].eatSpeed = 10;
                        break;
                    }
                default:
                    break;
            }
        }
    }

    //吃完了
    eatFinish() {
        let i = 0;
        for (i = 0; i < this.dining.length; i++) {
            //座位上有人
            if (this.dining[i]) {
                //如果在吃的话
                if (this.dining[i].position === 'eating') {
                    //speed实际是要吃完还需的时间
                    this.dining[i].eatSpeed -= 1;
                    //如果吃完了
                    if (this.dining[i].eatSpeed === 0) {
                        //根据顾客的food数组设置顾客状态
                        if (!this.dining[i].food.length) {
                            //状态为结账
                            this.dining[i].position = 'checkOut';
                        } else {
                            //状态为等餐
                            this.dining[i].position = 'seat';
                        }
                        //设置对应的餐食状态
                        this.dining[i].lastEat.position[i] = 'none';
                        this.dining[i].lastEat.whose[i] = 0;
                        this.dining[i].lastEat.theChef[i] = 0;
                    }
                }
            }
        }
    }

    //结账
    checkOut() {
        let i = 0;
        for (i = 0; i < this.dining.length; i++) {
            //座位上有人
            if (this.dining[i]) {
                if (this.dining[i].position === 'checkOut') {
                    //交钱
                    this.Money += this.dining[i].price;

                    //设置顾客状态
                    this.dining[i].position = 'out';
                    this.patient = 40;
                    this.eatSpeed = 20;
                    this.haveEat = false;
                    this.lastEat = 0;

                    let cus = this.dining[i];

                    //清空座位
                    this.dining[i] = 0;

                    console.log(cus.name + "吃完离开");
                }
            }
        }
    }

    //清空座位
    emptySeat() {
        let i = 0;
        for (i = 0; i < this.dining.length; i++) {
            if (!this.dining[i])
                buttonSeat[i].style["background-color"] = '';
        }
    }

    //清理过期菜和没人要的菜
    throwFood() {
        let i = 0;
        let j = 0;
        for (i = 0; i < this.readyFood.length; i++) {
            for (j = 0; j < this.dining.length; j++) {
                if (this.readyFood[i].position[j] === 'ed') {
                    this.readyFood[i].durability[j] -= 1;
                    if (this.readyFood[i].durability[j] <= 0)
                        this.readyFood.splice[i, 1];
                }
            }
        }

        for (i = 0; i < this.readyFood.length; i++) {
            for (j = 0; j < this.dining.length; j++) {
                if (this.readyFood[i].position[j] === 'ed') {
                    if (this.readyFood[i].whose[j].patient <= 0)
                        this.readyFood.splice[i, 1];
                }
            }
        }
    }
}

//厨师类 入口参数：名字，周工资
//厨师属性：名字，周工资，工作状态，总工作时长，当周工作时长，在做的菜
class ClassChef {
    constructor(name, salary) {
        this.name = name;
        this.salary = salary;
        this.position = "free";
        this.allWorkTime = 0;
        this.weekWorkTime = 0;
        this.cookingDish = [0, 0]; //第0项为餐食对象，第1项为对应的顾客对象
    }
}

//顾客类 入口参数：名字，头像
//顾客属性：名字，头像，当日是否就餐，点餐详情/在等的菜，餐食总价，当前位置/状态，耐心，吃饭速度，是否吃到菜，上一个吃完的菜
class ClassCustomer {
    constructor(name, headPortrait) {
        this.name = name;
        this.headPortrait = headPortrait;
        this.todayDining = false;
        this.food = []; //在等待的菜
        this.price = 0; //将支付的总价
        this.position = 'out'; //当前状态
        this.patient = 40; //耐心为40s
        this.eatSpeed = 20; //20s吃完
        this.haveEat = false; //已经吃到了菜
        this.lastEat = 0;
    }
}

//餐食类 入口参数：餐食名，餐食类型，成本，价格
//餐食属性：餐食名，餐食类型，成本，价格，当前状态，耗时，归属，在做的厨师，耐久度
class ClassFood {
    constructor(name, type, cost, price) {
        this.name = name;
        this.type = type;
        this.cost = cost;
        this.price = price;
        this.position = ["none", "none", "none", "none"]; //none，ing，ed表示没有，在做，做完两种情况
        this.needTime = [20, 20, 20, 20]; //做菜需要20s
        this.whose = [0, 0, 0, 0]; //无的菜不属于谁
        this.theChef = [0, 0, 0, 0]; //无的菜没人在做
        this.durability = [0, 0, 0, 0]; //耐久度
    }
}

//计时函数
function TimeKeeping(game) {
    if (game.TimeFlag === true) {
        //计时
        game.Time++;

        //随时更新页面计时和资金
        game.updateData(WEEK, DAY, MONEY);

        //按钮颜色管理
        game.buttonColor();

        TIMSMS.textContent = game.Time;

        //顾客来到餐厅
        game.customerComeToRestaurant()

        //清理队列顾客
        game.leaveFromQueue();

        //安排做菜
        game.cookListDish();

        //清理过期的菜和没人要的菜
        game.throwFood();

        //食物做好
        game.foodWell();

        //等菜太久
        game.refuseEat();

        //饭吃完
        game.eatFinish();

        //结账
        game.checkOut();

        //清空座位
        game.emptySeat();
    }
    //一天240s
    if (game.Time >= 240) {
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

//创建厨师对象
function CreateChef() {
    for (let i = 0; i < newGame.chefNames.length; i++) {
        newGame.allChef.push(new ClassChef(newGame.chefNames[i], 140));
    }
    console.log(newGame.allChef);
}

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

//绑定游戏各元素 先绑定文本值，再绑定按钮
function BindAllElement() {

    //绑定WEEK DAY MONEY
    WEEK = document.getElementById("WEEK");
    DAY = document.getElementById("DAY");
    MONEY = document.getElementById("MONEY");

    TIMSMS = document.getElementById("TIMEMS");

    //绑定厨师按钮
    for (let strNum = 1; strNum <= 6; strNum++) {
        buttonChef.push(document.getElementById("chef" + strNum));
    }

    //绑定队列按钮
    for (let strNum = 1; strNum <= 6; strNum++) {
        buttonQueue.push(document.getElementById("queue" + strNum));
    }

    //绑定座位按钮
    for (let strNum = 1; strNum <= 4; strNum++) {
        buttonSeat.push(document.getElementById("seat" + strNum));
    }

    //绑定菜单div
    foodMenu = document.getElementById("food-menu");

    //绑定点餐ing名字
    orderName = document.getElementById("order-name");
    //绑定点餐ing总价
    orderPrice = document.getElementById("order-price");

    //绑定菜单checkbox
    FoodMenuCheckbox = document.querySelectorAll(".food-menu-checkbox");

    //绑定点餐完毕按钮
    orderFinish = document.getElementById("order-ok");

    //绑定不吃了按钮
    notEat = document.getElementById("not-eat");

    //绑定解雇厨师界面
    fireChefWindow[0] = document.getElementById("fire-chef");
    fireChefWindow[1] = document.getElementById("fire-yes");
    fireChefWindow[2] = document.getElementById("fire-no");

    return true;
}

function AddListener() {

    //厨师按钮添加监听
    for (let i = 0; i < 6; i++) {
        buttonChef[i].addEventListener("click", function() {
            //该按钮为招聘厨师
            if (i === newGame.chef.length) {

                //如果招聘成功
                if (newGame.recruitChef()) {
                    //该按钮className改为显示
                    buttonChef[i]["className"] = "chef-on";

                    //没下一个按钮了
                    if (i === 5)
                        return true;

                    //后一个按钮改为招聘
                    buttonChef[i + 1]["className"] = "chef-add";
                    return true;
                }

            }
            //最后一个厨师对应的按钮
            else if (i === newGame.chef.length - 1) {

                if (newGame.chef[i].position === 'free') {
                    if (newGame.chef.length > 1) {

                        //显示解雇确认窗口
                        fireChefWindow[0].style["display"] = 'initial';

                        //计时停止
                        newGame.TimeStop();

                        //隔空传参
                        ListenerToFireChefYes = i;
                    }

                } else {
                    newGame.dishUp(newGame.chef[i]);
                }
            }


        });
    }

    //确认解雇厨师添加监听
    fireChefWindow[1].addEventListener("click", function() {

        if (!newGame.fireChef()) {
            if (newGame.chef.length !== 1)
                console.log("钱不够");
        }

        //这参数，啧
        let i = ListenerToFireChefYes;

        //这个按钮变为招聘
        buttonChef[i]["className"] = "chef-add";

        //计时恢复
        newGame.TimeResume();

        //没多的按钮了
        if (i === 5)
            return true;

        //多的按钮藏起来
        buttonChef[i + 1]["className"] = "chef-none";
    })

    //不解雇了添加监听
    fireChefWindow[2].addEventListener("click", function() {
        //隐藏解雇二次确认窗口
        fireChefWindow[0].style["display"] = 'none';
        //计时恢复
        newGame.TimeResume();
    })

    //座位按钮添加监听
    for (let i = 0; i < 4; i++) {
        buttonSeat[i].addEventListener("click", function() {
            //有人
            if (newGame.dining[i]) {
                if (newGame.dining[i].position === 'angry') {
                    newGame.appeaseAngry(newGame.dining[i], i);
                }
            }
        });
    }

    //队列按钮添加监听
    for (let i = 0; i < 6; i++) {
        buttonQueue[i].addEventListener("click", function() {

            //确定顾客座位
            let j;

            //就座成功立即进入点餐
            if (j = newGame.sitting()) {

                //判断条件限制，i为1，2，3，4，现给i自减
                j--;

                //按钮变色
                buttonQueue[i].style["background-color"] = "red";

                //2秒后按钮恢复颜色
                setTimeout(function() {
                    buttonQueue[i].style["background-color"] = "";
                }, 2000);

                //计时停止
                newGame.TimeStop();

                //弹出点餐界面
                foodMenu.style["display"] = "initial";

                //点餐处理
                orderCalculate(j);
            }
        });
    }

    //点餐完毕按钮添加监听
    orderFinish.addEventListener("click", orderFinishFunction);

    //不吃了按钮添加监听
    notEat.addEventListener("click", notEatFunction);
}

//点餐处理 入口参数：第i个座位 出口参数：第i个座位
function orderCalculate(i) {

    //点餐
    newGame.order(i)

    console.log(newGame.dining[i].food);

    //在菜单上打勾
    let j = 0;
    //在AllFood数组里的索引
    let indexInAllFood;
    //每种菜的个数
    hisOrder = [0, 0, 0];

    for (; j < newGame.dining[i].food.length; j++) {
        indexInAllFood = findIndexByValue(newGame.allFood, newGame.dining[i].food[j]);
        if (indexInAllFood <= newGame.coldDish[1])
            hisOrder[0]++;
        else if (indexInAllFood <= newGame.mainCourse[1])
            hisOrder[1]++;
        else
            hisOrder[2]++;

        //打勾
        FoodMenuCheckbox[indexInAllFood]["checked"] = "checked";
    }

    //点餐不合规矩
    if (hisOrder[0] > 1 || hisOrder[1] !== 1 || hisOrder[2] > 1) {
        //禁用点餐完毕按钮
        orderFinish["disabled"] = "disabled";
    }

    //给点餐完毕按钮传递参数
    orderCalculateToOrderFinish = i;

    //更新点餐情况
    newGame.updateOrder(orderName, orderPrice);

    return i;
}

//点餐完毕
function orderFinishFunction() {
    //接收来之不易的参数
    let i = orderCalculateToOrderFinish;

    //去掉菜单上的勾
    for (let j = 0; j < FoodMenuCheckbox.length; j++)
        FoodMenuCheckbox[j]["checked"] = "";

    //清空点菜数组
    hisOrder = [0, 0, 0];

    //恢复点餐完毕按钮
    orderFinish["disabled"] = "";

    //关闭点餐界面
    foodMenu.style["display"] = "none";

    //计时恢复
    newGame.TimeResume();
}

//不吃了
function notEatFunction() {
    //接收来之不易的参数
    let i = orderCalculateToOrderFinish;

    //放弃该顾客的点餐
    newGame.giveUpOrder(i, newGame.dining[i]);

    console.log(newGame.dining[i]);

    //去掉菜单上的勾
    for (let j = 0; j < FoodMenuCheckbox.length; j++)
        FoodMenuCheckbox[j]["checked"] = "";

    //清空点菜数组
    hisOrder = [0, 0, 0];

    //恢复点餐完毕按钮
    orderFinish["disabled"] = "";

    //关闭点餐界面
    foodMenu.style["display"] = "none";

    //计时恢复
    newGame.TimeResume();
}

//确认解雇
function deleteChefYes() {


}

let WEEK;
let DAY;
let MONEY;
let TIMSMS;
//厨师按钮
let buttonChef = [];
//队列按钮
let buttonQueue = [];
//座位按钮
let buttonSeat = [];

//菜单div
let foodMenu;

//点餐ing名字
let orderName;

//点餐ing总价
let orderPrice;

//顾客点的菜：符合规则情况
let hisOrder = [0, 0, 0];

//点餐完成按钮
let orderFinish;

//从点餐处理到点餐完成的参数
let orderCalculateToOrderFinish;

//从招聘监听到招聘确认按钮的参数
let ListenerToAddChefYes;

//从解雇监听到解雇确认按钮的参数
let ListenerToFireChefYes;

//不吃了按钮
let notEat;

//菜单checkbox
let FoodMenuCheckbox = [];

//解雇厨师界面及其按钮
let fireChefWindow = [];

//按按钮初始化游戏
document.getElementById("start-game").addEventListener("click", function() {
    newGame.Initialize();
});

//构造游戏对象
let newGame = new ClassGame();

//1s进行一次计时
setInterval(TimeKeeping, 400, newGame);