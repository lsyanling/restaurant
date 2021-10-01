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
        this.names = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'boqi', 'weige', 'lsy', 'ltsb', 'zhutou', 'html'];

        //餐食名集
        this.foodNames = ['凉拌baidu', '冰镇baidu', '爆炒baidu', '蛋煎baidu', '清蒸baidu', '红烧baidu', '油炸baidu', '可口baidu', 'baidu快线'];

        this.allChef = []; //所有厨师对象集
        this.chef = []; //餐厅厨师
        this.sitting = [0, 0, 0, 0]; //正在用餐
        this.customer = []; //所有顾客对象集
        this.queue = []; //排队
        this.headPortrait = [0, 1, 2, 3, 4, 5, 6]; //头像

        //表示菜在allFood中的索引范围
        this.coldDish = [0, 1]; //凉菜
        this.mainCourse = [2, 6]; //主菜
        this.drink = [7, 8]; //饮料

        //所有菜，便于查找
        this.allFood = [];

        //仅应该存已经做好但还没上的菜
        this.readyFood = [];

        //默认耐心值
        this.defaultPatient = [100, 200, 150, 150, 50];

        //默认吃饭速度
        this.defaultSpeed = [80, 150, 100];

        //默认做菜时间
        this.defaultneedTime = [80, 120, 40];
    }

    //初始化
    Initialize() {

        CreateChef();
        CreateCustomer();
        CreateFood();

        this.TimeResume();

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
        WEEK.textContent = 'W' + this.Week;
        DAY.textContent = 'D' + this.Day;
        MONEY.textContent = this.Money;
    }

    //每天事件处理
    DayHandling() {

        //厨师工作时间
        for (let i = 0; i < this.chef.length; i++)
            this.chef[i].weekWorkTime++;

        //生气顾客离开
        for (let i = 0; i < this.sitting.length; i++) {
            if (this.sitting[i] && this.sitting[i].position === 'angry') {
                this.appeaseAngry(i);
                this.sitting[i] = 0;
            }
        }

        //结账
        for (let i = 0; i < this.sitting.length; i++) {
            if (this.sitting[i] && this.sitting[i].position === 'checkOut') {
                this.checkOut(i);
                this.sitting[i] = 0;
            }
        }

        //顾客就餐刷新
        for (let i = 0; i < this.customer.length; i++)
            this.customer[i].todayDining = false;

    };

    //每周事件处理
    WeekHandling() {

        //厨师工资
        for (let i = 0; i < this.chef.length; i++)
            this.Money - Math.ceil(this.chef[i].weekWorkTime / 7 * this.chef[i].salary);

        //厨师工作时间
        for (let i = 0; i < this.chef.length; i++) {
            this.chef[i].allWorkTime += this.chef[i].weekWorkTime;
            this.chef[i].weekWorkTime = 0;
        }

        return true;
    };

    //招聘厨师
    recruitChef() {
        if (this.chef.length >= 6)
            return false;
        this.chef.push(this.allChef[0]);
        this.allChef.shift();
        return true;
    };

    //解雇厨师 入口参数：第i个厨师
    fireChef(i) {
        //不能一个也没有啊
        if (this.chef.length === 1)
            return false;

        if (this.Money < (Math.ceil(this.chef[i].weekWorkTime / 7 * this.chef[i].salary) + this.chef[i].salary))
            return false;

        //资金变动
        this.Money -= (Math.ceil(this.chef[i].weekWorkTime / 7 * this.chef[i].salary) + this.chef[i].salary);

        //厨师对象初始化
        this.chef[i].weekWorkTime = 0;
        this.chef[i].allWorkTime = 0;

        this.allChef.push(this.chef[i]);
        this.chef.splice(i, 1);

        return true;
    };

    //顾客来到餐厅
    customerComeToRestaurant() {

        //事件发生概率2%
        if ((Math.random() * 100) > 2)
            return false;

        //随机取一未就餐的顾客
        let i = Math.random() * 100;
        i = Math.floor(i);
        i %= this.customer.length;

        if (this.customer[i].todayDining)
            return false;

        //防止吃到第二天的顾客分身
        if (this.customer[i].position !== 'out')
            return false;

        //顾客当天就餐设为true
        this.customer[i].todayDining = true;

        //队列满则顾客不进来，该条满足顾客可能不来的要求
        if (this.queue.length > 5)
            return false;

        //顾客位置变更为队列
        this.customer[i].position = 'queue';

        this.customer[i].patient[3] = this.defaultPatient[3];

        //顾客入队
        this.queue.push(this.customer[i]);

        return true;
    };

    //顾客从队列离开
    leaveFromQueue() {
        for (let i = 0; i < this.queue.length; i++) {
            //索引3，队列耐心-1
            this.queue[i].patient[3] -= 1;

            //耐心为0
            if (this.queue[i].position === 'queue' && this.queue[i].patient[3] <= 0) {

                //顾客位置变更
                this.queue[i].position = 'out';
                //重置队列耐心
                this.queue[i].patient[3] = this.defaultPatient[3];

                //从队列中删除顾客
                this.queue.splice(i, 1);
                return true;
            }
        }
        return false;
    };

    //顾客就座和点餐 入口参数：第i个座位
    sitAndOrder(i) {

        //顾客就座
        this.sitting[i] = this.queue[0];

        //从队列中删除顾客
        this.queue.shift();

        //顾客状态变更
        this.sitting[i].position = 'seat';

        //顾客队列耐心重置
        this.sitting[i].patient[3] = this.defaultPatient[3];

        //顾客食物数组清零
        this.sitting[i].food = [0, 0, 0];
        this.sitting[i].eatingFood = [0, 0, 0];
        this.sitting[i].haveEat = [0, 0, 0];
        this.sitting[i].cookingFood = [0, 0, 0];
        this.sitting[i].notEat = [0, 0, 0];

        return true;
    }

    //顾客刷新 入口参数：顾客对象
    freeCustomer(customer) {
        customer.food = [0, 0, 0];
        customer.eatingFood = [0, 0, 0];
        customer.haveEat = [0, 0, 0];
        customer.notEat = [0, 0, 0];
        customer.cookingFood = [0, 0, 0];
        customer.eatSpeed = 0;
        customer.price = 0;
        customer.position = 'out'; //当前位置
        customer.patient = [0, 0, 0, this.defaultPatient[3], this.defaultPatient[4]];
    }

    //不吃了的菜
    refuseEat() {
        let i = 0;
        for (; i < this.sitting.length; i++) {

            //有人
            if (this.sitting[i]) {

                //耐心减少
                for (let j = 0; this.sitting[i].food[j]; j++) {
                    let index = findIndexByValue(this.sitting[i].haveEat, this.sitting[i].food[j]);

                    //这个菜没有吃完
                    if (typeof(index) !== 'number') {
                        index = findIndexByValue(this.sitting[i].eatingFood, this.sitting[i].food[j])

                        //这个菜不是正在吃
                        if (typeof(index) !== 'number') {
                            index = findIndexByValue(this.sitting[i].notEat, this.sitting[i].food[j])

                            //这个菜也不是不要了
                            if (typeof(index) !== 'number') {
                                //说明这个菜还没上

                                this.sitting[i].patient[j] -= 1;

                                //不吃了
                                if (this.sitting[i].patient[j] <= 0) {

                                    //不付钱
                                    this.sitting[i].price -= this.sitting[i].food[j].price;
                                    let notEatIndex = findIndexByValue(this.sitting[i].notEat, 0);
                                    this.sitting[i].notEat[notEatIndex] = this.sitting[i].food[j];
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    //生气
    angry() {
        let i = 0;
        for (; i < this.sitting.length; i++) {
            //有人
            if (this.sitting[i]) {

                //判断点了几个菜
                let index = findIndexByValue(this.sitting[i].food, 0);

                //说明点满了菜
                if (typeof(index) !== 'number')
                    index = 3;

                //在notEat中的food元素的个数
                let inNum = 0;

                //是否food的每个元素都在notEat中
                for (let j = 0; j < index; j++) {
                    let inFlag = findIndexByValue(this.sitting[i].notEat, this.sitting[i].food[j]);

                    //在notEat里
                    if (typeof(inFlag) === 'number')
                        inNum++;
                }

                //food的每个元素都在notEat中
                if (inNum === index) {
                    //设置顾客状态
                    this.sitting[i].position = 'angry';
                }
            }

        }
    }

    //安抚生气 入口参数：第i个座位
    appeaseAngry(i) {
        if (this.sitting[i].position === 'angry') {

            //设置顾客状态
            this.freeCustomer(this.sitting[i]);

            //清空座位
            this.sitting[i] = 0;

            return true;
        }
        return false;
    }

    //开始做菜
    chefCookDish() {
        let i = 0;
        let j = 0;
        //第几个顾客耐心最小
        let minPatient = 1000;
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
        //这里只好用排除法求得还没上的菜
        for (i = 0; i < this.sitting.length; i++) {
            //座位上有人
            if (this.sitting[i]) {
                for (j = 0; j < 3; j++) {
                    if (!this.sitting[i].food[j])
                        continue;
                    //在等菜
                    if (this.sitting[i].position === 'seat') {
                        let index = findIndexByValue(this.sitting[i].haveEat, this.sitting[i].food[j])
                            //这个菜没有吃完
                        if (typeof(index) !== 'number') {
                            index = findIndexByValue(this.sitting[i].eatingFood, this.sitting[i].food[j])
                                //这个菜不是正在吃
                            if (typeof(index) !== 'number') {
                                index = findIndexByValue(this.sitting[i].notEat, this.sitting[i].food[j])
                                    //这个菜也不是不要了
                                if (typeof(index) !== 'number') {
                                    index = findIndexByValue(this.sitting[i].cookingFood, this.sitting[i].food[j])
                                        //这个菜没在做着
                                    if (typeof(index) !== 'number') {
                                        if (this.sitting[i].patient[j] < minPatient) {
                                            minPatient = this.sitting[i].patient[j];
                                            minPatientIndex = [i, j];
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        //那没办法了，下次再说
        if (minPatientIndex === 'none')
            return false;

        i = minPatientIndex[0];
        j = minPatientIndex[1];

        //扣除成本
        this.Money -= this.sitting[i].food[j].cost;

        //设置厨师状态
        this.chef[freeChefIndex].position = 'busy';
        this.chef[freeChefIndex].cookingDish = this.sitting[i].food[j];
        let cd = findIndexByValue(this.sitting[i].food[j].position, 0);
        this.chef[freeChefIndex].cookingDishIndex = cd;

        //设置顾客状态
        let cf = findIndexByValue(this.sitting[i].cookingFood, 0);
        this.sitting[i].cookingFood[cf] = this.sitting[i].food[j];

        //设置餐食状态
        this.sitting[i].food[j].position[cd] = 'cooking';
        this.sitting[i].food[j].theChef[cd] = this.chef[freeChefIndex];

        let typeIndex = this.sitting[i].food[j].type;

        this.sitting[i].food[j].needTime[cd] = this.defaultneedTime[typeIndex];

        return true;
    }

    //菜做好
    foodWell() {
        let i = 0;
        let j = 0;
        //遍历厨师
        for (i = 0; i < this.chef.length; i++) {
            //如果在工作
            if (this.chef[i].position === 'busy') {

                j = this.chef[i].cookingDishIndex;

                //needTime-1
                this.chef[i].cookingDish.needTime[j] -= 1;

                //做好了
                if (this.chef[i].cookingDish.needTime[j] <= 0) {

                    //变更菜的状态
                    this.chef[i].cookingDish.position[j] = 'complete';

                    //变更对应厨师的状态
                    this.chef[i].position = 'complete';

                    //设置菜的耐久
                    this.chef[i].cookingDish.durability[j] = 100;

                    //将菜送入ready数组
                    this.readyFood.push(this.chef[i].cookingDish);
                }
            }
        }
    }

    //上菜 入口参数：第i个座位的第j个菜
    dishUp(i, j) {

        //找这个菜
        let index = findIndexByValue(this.readyFood, this.sitting[i].food[j]);

        //设置对应厨师状态
        this.readyFood[index].theChef[0].position = 'free';
        this.readyFood[index].theChef[0].cookingDish = 0;
        this.readyFood[index].theChef[0].cookingDishIndex = 'none';

        //餐食对象中弹出这个状态
        this.readyFood[index].position.shift();
        this.readyFood[index].needTime.shift();
        this.readyFood[index].theChef.shift();
        this.readyFood[index].durability.shift();

        //补充新的状态
        this.readyFood[index].position[5] = 0;
        this.readyFood[index].needTime[5] = 0;
        this.readyFood[index].theChef[5] = 0;
        this.readyFood[index].durability[5] = 0;

        //索引修正
        for (let k = 0; this.readyFood[index].theChef[k]; k++) {
            this.readyFood[index].theChef[k].cookingDishIndex -= 1;
        }

        //设置顾客的餐食
        let eatingIndex = findIndexByValue(this.sitting[i].eatingFood, 0);
        this.sitting[i].eatingFood[eatingIndex] = this.readyFood[index];

        //如果桌上只有这个菜，设置顾客的eatSpeed
        if (!eatingIndex) {
            let typeIndex = this.sitting[i].eatingFood[0].type;
            this.sitting[i].eatSpeed = this.defaultSpeed[typeIndex];
        }

        //从readyFood中删除
        this.readyFood.splice(index, 1);

        return true;
    }

    //吃完了
    finishAFood() {
        let i = 0;
        for (i = 0; i < this.sitting.length; i++) {

            //座位上有人
            if (this.sitting[i]) {

                //什么时候会开始吃
                if (this.sitting[i].eatingFood[0])
                    this.sitting[i].position = 'eating';

                //如果在吃的话
                if (this.sitting[i].position === 'eating') {

                    //speed实际是要吃完还需的时间
                    this.sitting[i].eatSpeed -= 1;

                    //如果吃完了
                    if (this.sitting[i].eatSpeed <= 0) {

                        //进入吃完数组
                        let haveEatIndex = findIndexByValue(this.sitting[i].haveEat, 0);
                        this.sitting[i].haveEat[haveEatIndex] = this.sitting[i].eatingFood[0];
                        //从正在吃数组删除
                        this.sitting[i].eatingFood.shift();
                        this.sitting[i].eatingFood.push(0);

                        //根据下一个菜设置eatSpeed
                        if (this.sitting[i].eatingFood[0]) {
                            let typeIndex = this.sitting[i].eatingFood[0].type;
                            this.sitting[i].eatSpeed = this.defaultSpeed[typeIndex];
                        }
                    }
                }
            }
        }
    }

    //顾客状态设置：除生气外
    setCustomerPosition() {
        let i = 0;

        for (i = 0; i < this.sitting.length; i++) {
            //各数组中的菜的个数
            let haveEatNum = 0;
            let notEatNum = 0;
            let findFlag = false;
            let setFlag = false;
            //有人
            if (this.sitting[i]) {

                let flag = findIndexByValue(this.sitting[i].eatingFood, 0);
                //当eatingFood为空时
                if (typeof(flag) === 'number' && flag === 0) {

                    let j = 0;
                    for (j = 0; this.sitting[i].food[j]; j++) {

                        findFlag = findIndexByValue(this.sitting[i].haveEat, this.sitting[i].food[j]);

                        //在吃完了数组中
                        if (typeof(findFlag) === 'number') {
                            haveEatNum++;
                            continue;
                        }

                        findFlag = findIndexByValue(this.sitting[i].notEat, this.sitting[i].food[j]);
                        //在不吃了数组中
                        if (typeof(findFlag) === 'number') {
                            notEatNum++;
                            continue;
                        }

                        //有菜不在以上两个数组中，说明还有菜未上，状态为seat
                        this.sitting[i].position = 'seat';
                        setFlag = true;
                        break;
                    }

                    //如果刚才设置了状态
                    if (setFlag)
                        continue;

                    //吃到了，且吃到的和不吃了的数量加起来等于点的数量，状态为checkOut
                    if (haveEatNum && haveEatNum + notEatNum === j)
                        this.sitting[i].position = 'checkOut';
                }
            }
        }
    }

    //结账 入口参数：第i个座位
    checkOut(i) {
        if (this.sitting[i].position === 'checkOut') {
            //交钱
            this.Money += this.sitting[i].price;

            //设置顾客状态
            this.freeCustomer(this.sitting[i]);

            //清空座位
            this.sitting[i] = 0;
            return true;
        }
        return false;
    }

    //清理过期食物
    throwFood() {
        let i = 0;
        let j = 0;
        //耐久-1
        for (i = 0; i < this.allFood.length; i++) {
            for (j = 0; j < this.allFood[i].position.length; j++) {
                if (this.allFood[i].position[j] === 'complete') {
                    this.allFood[i].durability[j] -= 1;
                    if (this.allFood[i].durability[0] <= 0) {

                        let index = findIndexByValue(this.readyFood, this.allFood[i]);

                        if (typeof(index) !== 'number')
                            continue;

                        //设置对应厨师状态
                        this.readyFood[index].theChef[0].position = 'free';
                        this.readyFood[index].theChef[0].cookingDish = 0;
                        this.readyFood[index].theChef[0].cookingDishIndex = 'none';

                        //餐食对象中弹出这个状态
                        this.readyFood[index].position.shift();
                        this.readyFood[index].needTime.shift();
                        this.readyFood[index].theChef.shift();
                        this.readyFood[index].durability.shift();

                        //补充新的状态
                        this.readyFood[index].position[5] = 0;
                        this.readyFood[index].needTime[5] = 0;
                        this.readyFood[index].theChef[5] = 0;
                        this.readyFood[index].durability[5] = 0;

                        //索引修正
                        for (let k = 0; this.readyFood[index].theChef[k]; k++) {
                            this.readyFood[index].theChef[k].cookingDishIndex -= 1;
                        }

                        //从readyFood中删除
                        this.readyFood.splice(index, 1);
                    }
                }
            }
        }
    }
}


//厨师类 入口参数：名字，周工资
//厨师属性：名字，周工资，工作状态，总工作时长，当周工作时长，在做的菜
class ClassChef {
    constructor() {
        this.salary = 140;
        this.position = "free";
        this.allWorkTime = 0;
        this.weekWorkTime = 0;
        this.cookingDish = 0; //餐食对象
        this.cookingDishIndex = 'none'; //这个厨师在餐食对象中排第几
    }
}

//顾客类 入口参数：名字，头像
//顾客属性：名字，头像，当日是否就餐，点餐详情/在等的菜，餐食总价，当前位置/状态，耐心，吃饭速度，是否吃到菜，上一个吃完的菜
class ClassCustomer {
    constructor(name, headPortrait) {
        this.name = name;
        this.headPortrait = headPortrait;
        this.todayDining = false;
        this.food = [0, 0, 0]; //所有点的菜
        this.price = 0; //将支付的总价
        this.position = 'out'; //当前状态
        this.patient = [0, 0, 0, 0, 0]; //前3个为等菜的耐心，索引3为队列耐心，索引4为结账耐心
        this.eatSpeed = 0; //吃饭速度
        this.eatingFood = [0, 0, 0]; //正在吃的菜
        this.haveEat = [0, 0, 0]; //已经吃完的菜
        this.notEat = [0, 0, 0]; //不吃了的菜
        this.cookingFood = [0, 0, 0]; //正在做的菜
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
        this.position = [0, 0, 0, 0, 0, 0]; //0表示不存在，'cooking'表示在做，'complete'表示做好了，'dishUp'表示已经上菜，'eating'表示顾客在吃
        this.needTime = [0, 0, 0, 0, 0, 0]; //做菜需要的时间
        this.theChef = [0, 0, 0, 0, 0, 0]; //做这个菜的厨师
        this.durability = [0, 0, 0, 0, 0, 0]; //还有多久倒掉
    }
}

//元素类
class ClassElement {
    constructor(timems, startWindow, startGame, foodMenu, orderYes, orderNo, CheckBox, orderName, orderPrice, recruitWindow, recruitYes, recruitNo, fireWindow, fireYes, fireNo, day, week, money, blackShadow, divChefBlock, chef, shadowChefCustomer, chefImg, chefBar, addBlock, deleteBlock, divComplete, divSeat, customerImg, customerBar, customerBarLine, dishUp, divAppease, divCheck, divCustomer, shadowCookBar, shadowSeatBar, shadowQueueBar, chefPay) {
        this.TIMEMS = timems; //id
        this.startWindow = startWindow; //id
        this.startGame = startGame; //id
        this.foodMenu = foodMenu; //id
        this.orderYes = orderYes; //id
        this.orderNo = orderNo; //id
        this.CheckBox = CheckBox; //class数组
        this.orderName = orderName; //id
        this.orderPrice = orderPrice; //id
        this.recruitWindow = recruitWindow; //class
        this.recruitYes = recruitYes; //id
        this.recruitNo = recruitNo; //id
        this.fireWindow = fireWindow; //class
        this.fireYes = fireYes; //id
        this.fireNo = fireNo; //id
        this.DAY = day; //id
        this.WEEK = week; //id
        this.MONEY = money; //id
        this.blackShadow = blackShadow; //id
        this.divChefBlock = divChefBlock; //id
        this.chef = chef; //class数组，0-5是厨师圈，初始化时必须将第2-5都加上block-hidden类
        this.shadowChefCustomer = shadowChefCustomer; //class数组，行索引0是厨师镜像，行索引1是队列镜像
        this.chefImg = chefImg; //class数组，0-5是厨师图像，初始化时必须将1变更为chef-filter类，后面的加上block-hidden类
        this.chefBar = chefBar; //class数组，0-5是厨师bar，初始化时必须给所有的加上block-hidden类
        this.addBlock = addBlock; //class数组，0-5是厨师招聘+号，初始化时必须给除了1以外的都加上block-hidden类
        this.deleteBlock = deleteBlock; //class数组，0-5是厨师解雇x号，初始化时必须给所有的都加上block-hidden类
        this.divComplete = divComplete; //class数组，0-5是厨师做好菜的样子，初始化时必须给所有的都加上block-hidden类
        this.divSeat = divSeat; //class数组，0-3是座位圈
        this.customerImg = customerImg; //class二维数组，行索引0是座位的顾客头像，1是队列的顾客头像，2是点菜的顾客头像，修改时改src属性，初始化时必须都加上block-hidden类
        this.customerBar = customerBar; //class二维数组，行索引是座位号，列索引是座位上的bar号，初始化时必须都加上block-hidden类
        this.customerBarLine = customerBarLine; //class二维数组，行索引是座位号，列索引是座位上的bar的line号，初始化时必须都加上block-hidden类
        this.dishUp = dishUp; //class二维数组，行索引是座位号，列索引是座位上的bar的dishUp号，初始化时必须都加上block-hidden类
        this.divAppease = divAppease; //class数组，初始化时必须都加上block-hidden类
        this.divCheck = divCheck; //class数组，初始化时必须都加上block-hidden类
        this.divCustomer = divCustomer; //class数组，初始化时必须都加上block-hidden类
        this.shadowCookBar = shadowCookBar; //class数组，初始化时必须都加上block-hidden类
        this.shadowSeatBar = shadowSeatBar; //class二维数组，行索引是座位号，列索引是座位上的bar号，初始化时必须都加上block-hidden类
        this.shadowQueueBar = shadowQueueBar; //class数组，初始化时必须都加上block-hidden类
        this.chefPay = chefPay; //id
    }
}

//创建游戏对象
let newGame = new ClassGame();

//创建元素对象
let Elements = new ClassElement(document.getElementById('TIMEMS'), document.getElementById('start-window'), document.getElementById('start-game'), document.getElementById('food-menu'), document.getElementById('order-yes'), document.getElementById('order-no'), document.querySelectorAll('.dish'), document.getElementById('order-name'), document.getElementById('order-price'), document.querySelector('.recruit-window'), document.getElementById('recruit-yes'), document.getElementById('recruit-no'), document.querySelector('.fire-window'), document.getElementById('fire-yes'), document.getElementById('fire-no'), document.getElementById('DAY'), document.getElementById('WEEK'), document.getElementById('MONEY'), document.getElementById('black-shadow'), document.getElementById('div-chef-block'), document.querySelectorAll('.div-chef'), [
    [(document.querySelectorAll('.shadow-chef-customer'))[0], (document.querySelectorAll('.shadow-chef-customer'))[1], (document.querySelectorAll('.shadow-chef-customer'))[2], (document.querySelectorAll('.shadow-chef-customer'))[3], (document.querySelectorAll('.shadow-chef-customer'))[4], (document.querySelectorAll('.shadow-chef-customer'))[5]],
    [(document.querySelectorAll('.shadow-chef-customer'))[10], (document.querySelectorAll('.shadow-chef-customer'))[11], (document.querySelectorAll('.shadow-chef-customer'))[12], (document.querySelectorAll('.shadow-chef-customer'))[13], (document.querySelectorAll('.shadow-chef-customer'))[14], (document.querySelectorAll('.shadow-chef-customer'))[15]]
], document.querySelectorAll('.chef-img'), document.querySelectorAll('.chef-bar'), document.querySelectorAll('.add-block'), document.querySelectorAll('.delete-block'), document.querySelectorAll('.div-complete'), document.querySelectorAll('.div-seat'), [
    [(document.querySelectorAll('.customer-img'))[0], (document.querySelectorAll('.customer-img'))[1], (document.querySelectorAll('.customer-img'))[2], (document.querySelectorAll('.customer-img'))[3]],
    [(document.querySelectorAll('.customer-img'))[4], (document.querySelectorAll('.customer-img'))[5], (document.querySelectorAll('.customer-img'))[6], (document.querySelectorAll('.customer-img'))[7], (document.querySelectorAll('.customer-img'))[8], (document.querySelectorAll('.customer-img'))[9]],
    [(document.querySelectorAll('.customer-img'))[10]]
], [
    [(document.querySelectorAll('.customer-bar'))[0], (document.querySelectorAll('.customer-bar'))[1], (document.querySelectorAll('.customer-bar'))[2]],
    [(document.querySelectorAll('.customer-bar'))[3], (document.querySelectorAll('.customer-bar'))[4], (document.querySelectorAll('.customer-bar'))[5]],
    [(document.querySelectorAll('.customer-bar'))[6], (document.querySelectorAll('.customer-bar'))[7], (document.querySelectorAll('.customer-bar'))[8]],
    [(document.querySelectorAll('.customer-bar'))[9], (document.querySelectorAll('.customer-bar'))[10], (document.querySelectorAll('.customer-bar'))[11]]
], [
    [(document.querySelectorAll('.customer-bar-line'))[0], (document.querySelectorAll('.customer-bar-line'))[1], (document.querySelectorAll('.customer-bar-line'))[2]],
    [(document.querySelectorAll('.customer-bar-line'))[3], (document.querySelectorAll('.customer-bar-line'))[4], (document.querySelectorAll('.customer-bar-line'))[5]],
    [(document.querySelectorAll('.customer-bar-line'))[6], (document.querySelectorAll('.customer-bar-line'))[7], (document.querySelectorAll('.customer-bar-line'))[8]],
    [(document.querySelectorAll('.customer-bar-line'))[9], (document.querySelectorAll('.customer-bar-line'))[10], (document.querySelectorAll('.customer-bar-line'))[11]]
], [
    [(document.querySelectorAll('.dish-up'))[0], (document.querySelectorAll('.dish-up'))[1], (document.querySelectorAll('.dish-up'))[2]],
    [(document.querySelectorAll('.dish-up'))[3], (document.querySelectorAll('.dish-up'))[4], (document.querySelectorAll('.dish-up'))[5]],
    [(document.querySelectorAll('.dish-up'))[6], (document.querySelectorAll('.dish-up'))[7], (document.querySelectorAll('.dish-up'))[8]],
    [(document.querySelectorAll('.dish-up'))[9], (document.querySelectorAll('.dish-up'))[10], (document.querySelectorAll('.dish-up'))[11]]
], document.querySelectorAll('.div-appease'), document.querySelectorAll('.div-check'), document.querySelectorAll('.div-customer'), document.querySelectorAll('.shadow-cook-bar'), [
    [(document.querySelectorAll('.shadow-seat-bar'))[0], (document.querySelectorAll('.shadow-seat-bar'))[1], (document.querySelectorAll('.shadow-seat-bar'))[2]],
    [(document.querySelectorAll('.shadow-seat-bar'))[3], (document.querySelectorAll('.shadow-seat-bar'))[4], (document.querySelectorAll('.shadow-seat-bar'))[5]],
    [(document.querySelectorAll('.shadow-seat-bar'))[6], (document.querySelectorAll('.shadow-seat-bar'))[7], (document.querySelectorAll('.shadow-seat-bar'))[8]],
    [(document.querySelectorAll('.shadow-seat-bar'))[9], (document.querySelectorAll('.shadow-seat-bar'))[10], (document.querySelectorAll('.shadow-seat-bar'))[11]]
], document.querySelectorAll('.shadow-queue-bar'), document.getElementById('chef-pay'));

//状态刷新函数集合
class ClassRefresh {
    constructor(Elements, newGame) {
        this.Elements = Elements;
        this.newGame = newGame;
    }

    //队列刷新
    rfQueue() {
        let i = 0;

        for (i = 0; i < newGame.queue.length; i++) {

            Elements.divCustomer[i].className = 'div-customer';

            //头像对应
            switch (newGame.queue[i].headPortrait) {
                case 0:
                    { Elements.customerImg[1][i].src = 'restaurant/379448-512.png'; break; }
                case 1:
                    { Elements.customerImg[1][i].src = 'restaurant/379339-512.png'; break; }
                case 2:
                    { Elements.customerImg[1][i].src = 'restaurant/379446-512.png'; break; }
                case 3:
                    { Elements.customerImg[1][i].src = 'restaurant/iconfinder_Boss-3_379348.png'; break; }
                case 4:
                    { Elements.customerImg[1][i].src = 'restaurant/iconfinder_Man-16_379485.png'; break; }
                case 5:
                    { Elements.customerImg[1][i].src = 'restaurant/iconfinder_Rasta_379441.png'; break; }
                case 6:
                    { Elements.customerImg[1][i].src = 'restaurant/379444-512.png'; break; }
                default:
                    break;
            }

            //shadow长度控制
            Elements.shadowQueueBar[i].style['width'] = 72 - 72 / newGame.defaultPatient[3] * newGame.queue[i].patient[3] + 'px';
        }

        //没人的时候
        for (; i < 6; i++) {
            Elements.divCustomer[i].className = 'block-hidden';
        }
    }

    rfSeat() {
        let i = 0;
        let j = 0;
        for (i = 0; i < 4; i++) {
            //座位上有人
            if (newGame.sitting[i]) {

                //显示头像
                Elements.customerImg[0][i].className = 'customer-img';

                //头像对应
                switch (newGame.sitting[i].headPortrait) {
                    case 0:
                        { Elements.customerImg[0][i].src = 'restaurant/379448-512.png'; break; }
                    case 1:
                        { Elements.customerImg[0][i].src = 'restaurant/379339-512.png'; break; }
                    case 2:
                        { Elements.customerImg[0][i].src = 'restaurant/379446-512.png'; break; }
                    case 3:
                        { Elements.customerImg[0][i].src = 'restaurant/iconfinder_Boss-3_379348.png'; break; }
                    case 4:
                        { Elements.customerImg[0][i].src = 'restaurant/iconfinder_Man-16_379485.png'; break; }
                    case 5:
                        { Elements.customerImg[0][i].src = 'restaurant/iconfinder_Rasta_379441.png'; break; }
                    case 6:
                        { Elements.customerImg[0][i].src = 'restaurant/379444-512.png'; break; }
                    default:
                        break;
                }

                //显示座位颜色
                switch (newGame.sitting[i].position) {
                    case 'seat':
                        { Elements.divSeat[i].className = 'div-seat div-seat-wait'; break; }
                    case 'eating':
                        { Elements.divSeat[i].className = 'div-seat div-seat-eating'; break; }
                    case 'angry':
                        { Elements.divSeat[i].className = 'div-seat div-seat-angry'; break; }
                    case 'checkOut':
                        { Elements.divSeat[i].className = 'div-seat div-seat-check-out'; break; }
                    default:
                        break;
                }

                //设置bar
                for (j = 0; j < 3; j++) {
                    //是餐食
                    if (typeof(newGame.sitting[i].food[j]) === 'object') {

                        //设置bar上的文字
                        Elements.customerBar[i][j].textContent = newGame.sitting[i].food[j].name;

                        //出现在haveEat
                        if (typeof(findIndexByValue(newGame.sitting[i].haveEat, newGame.sitting[i].food[j])) === 'number') {
                            Elements.customerBar[i][j].className = 'customer-bar bar' + j + ' check-out-bar';
                            continue;
                        }

                        //出现在eatingFood
                        else if (typeof(findIndexByValue(newGame.sitting[i].eatingFood, newGame.sitting[i].food[j])) === 'number') {
                            Elements.customerBar[i][j].className = 'customer-bar bar' + j + ' eating-bar';
                            //shadow长度控制
                            let typeIndex = newGame.sitting[i].food[j].type;
                            Elements.shadowSeatBar[i][j].style['width'] = 72 - 72 / newGame.defaultSpeed[typeIndex] * newGame.sitting[i].eatSpeed + 'px';
                            //但如果还没开始吃，长度为0
                            if (findIndexByValue(newGame.sitting[i].eatingFood, newGame.sitting[i].food[j]))
                                Elements.shadowSeatBar[i][j].style['width'] = '0px';
                            continue;
                        }

                        //出现在notEat
                        else if (typeof(findIndexByValue(newGame.sitting[i].notEat, newGame.sitting[i].food[j])) === 'number') {
                            Elements.customerBar[i][j].className = 'customer-bar bar' + j + ' not-eat-bar';
                            Elements.shadowSeatBar[i][j].style['width'] = '0px';
                            //画线
                            Elements.customerBarLine[i][j].className = 'customer-bar-line bar' + j + '-line';

                            //隐藏上菜按钮
                            Elements.dishUp[i][j].className = 'block-hidden';
                            continue;
                        }

                        //等待中
                        else {
                            Elements.customerBar[i][j].className = 'customer-bar bar' + j + ' wait-bar';

                            //如果菜做好了，显示上菜
                            if (newGame.sitting[i].food[j].position[0] === 'complete')
                                Elements.dishUp[i][j].className = 'dish-up';

                            //如果没做好，不显示
                            if (newGame.sitting[i].food[j].position[0] !== 'complete')
                                Elements.dishUp[i][j].className = 'block-hidden';

                            //shadow长度控制
                            let typeIndex = newGame.sitting[i].food[j].type;
                            Elements.shadowSeatBar[i][j].style['width'] = 72 - 72 / newGame.defaultPatient[typeIndex] * newGame.sitting[i].patient[j] + 'px';
                            continue;
                        }
                    }
                }

                //设置结账和安抚
                if (newGame.sitting[i].position === 'checkOut') {
                    Elements.divCheck[i].className = 'div-check';
                }
                if (newGame.sitting[i].position === 'angry') {
                    Elements.divAppease[i].className = 'div-appease';
                }
            }

            //座位上没人
            else {
                //清空头像
                Elements.customerImg[0][i].className = 'block-hidden';
                //清空座位颜色
                Elements.divSeat[i].className = 'div-seat div-seat-none';
                //清空bar
                for (j = 0; j < 3; j++) {
                    Elements.shadowSeatBar[i][j].style['width'] = '0px';
                    Elements.customerBar[i][j].className = 'block-hidden';
                    Elements.customerBarLine[i][j].className = 'block-hidden';
                    Elements.dishUp[i][j].className = 'block-hidden';
                }
                //清空结账和安抚
                Elements.divCheck[i].className = 'block-hidden';
                Elements.divAppease[i].className = 'block-hidden';

            }
        }
    }

    rfChef() {

        //厨师数量为两个及以下时，削减厨房面积
        if (newGame.chef.length < 3) {
            Elements.divChefBlock.style['height'] = '18%';
        }

        if (newGame.chef.length >= 3) {
            Elements.divChefBlock.style['height'] = '36%';
        }

        let i = 0;
        for (i = 0; i < newGame.chef.length; i++) {
            //空闲的厨师
            if (newGame.chef[i].position === 'free') {

                //去掉颜色
                Elements.chef[i].className = 'div-chef div-chef-free';

                //隐藏bar
                Elements.chefBar[i].className = 'block-hidden';
                Elements.shadowCookBar[i].style['width'] = '0px';

                //隐藏complete
                Elements.divComplete[i].className = 'block-hidden';

                //隐藏招聘按钮
                Elements.addBlock[i].className = 'block-hidden';

                //设置解雇按钮
                if (newGame.chef.length !== 1)
                    Elements.deleteBlock[i].className = 'delete-block';
                else
                    Elements.deleteBlock[i].className = 'block-hidden';
            }

            //在炒菜
            else if (newGame.chef[i].position === 'busy') {
                //设置颜色
                Elements.chef[i].className = 'div-chef div-chef-busy';

                //设置bar和shadow长度
                Elements.chefBar[i].className = 'chef-bar cooking-bar';

                let j = newGame.chef[i].cookingDishIndex;
                let typeIndex = newGame.chef[i].cookingDish.type;
                Elements.shadowCookBar[i].style['width'] = 72 - 72 / newGame.defaultneedTime[typeIndex] * newGame.chef[i].cookingDish.needTime[j] + 'px';

                //设置bar的文字
                Elements.chefBar[i].textContent = newGame.chef[i].cookingDish.name;

                //隐藏complete
                Elements.divComplete[i].className = 'block-hidden';

                //隐藏解雇按钮
                Elements.deleteBlock[i].className = 'block-hidden';

                //隐藏招聘按钮
                Elements.addBlock[i].className = 'block-hidden';
            }

            //做好了
            else if (newGame.chef[i].position === 'complete') {
                //设置颜色
                Elements.chef[i].className = 'div-chef div-chef-complete';

                //设置bar和shadow长度
                Elements.chefBar[i].className = 'chef-bar complete-bar';
                Elements.shadowCookBar[i].style['width'] = '72px';

                //设置bar的文字
                Elements.chefBar[i].textContent = newGame.chef[i].cookingDish.name;

                //显示complete
                Elements.divComplete[i].className = 'div-complete';

                //隐藏解雇按钮
                Elements.deleteBlock[i].className = 'block-hidden';

                //隐藏招聘按钮
                Elements.addBlock[i].className = 'block-hidden';
            }
        }
        if (i < 6) {
            //去掉颜色
            Elements.chef[i].className = 'div-chef div-chef-free';

            //投影
            Elements.chefImg[i].className = 'chef-filter';

            //隐藏bar
            Elements.chefBar[i].className = 'block-hidden';
            Elements.shadowCookBar[i].style['width'] = '0px';

            //隐藏complete
            Elements.divComplete[i].className = 'block-hidden';

            //显示招聘按钮
            Elements.addBlock[i].className = 'add-block';

            //设置解雇按钮
            Elements.deleteBlock[i].className = 'block-hidden';
        }

        for (i = i + 1; i < 6; i++) {
            Elements.chef[i].className = 'block-hidden';
        }
    }

    rfMenu() {

        let i = 0;
        //点餐是否符合规则
        let food = [0, 0, 0];
        orderFood = [];
        let price = 0;

        for (i = 0; i < newGame.mainCourse[0]; i++) {
            if (Elements.CheckBox[i].checked) {
                food[0] += 1;
                orderFood.push(newGame.allFood[i]);
            }
        }
        for (; i < newGame.drink[0]; i++) {
            if (Elements.CheckBox[i].checked) {
                food[1] += 1;
                orderFood.push(newGame.allFood[i]);
            }
        }
        for (; i <= newGame.drink[1]; i++) {
            if (Elements.CheckBox[i].checked) {
                food[2] += 1;
                orderFood.push(newGame.allFood[i]);
            }
        }

        //即时显示价格
        for (let i = 0; i < orderFood.length; i++)
            price += orderFood[i].price;
        Elements.orderPrice.textContent = price;

        //不符合规则
        if (food[0] > 1 || food[2] > 1 || food[1] !== 1) {
            Elements.orderYes.style['background-color'] = 'rgb(130, 110, 60)';
            Elements.orderYes.removeEventListener('click', orderYesFunction);
        } else {
            Elements.orderYes.style['background-color'] = '';
            Elements.orderYes.addEventListener('click', orderYesFunction);
        }

    }
}

//创建刷新函数对象
let Refresh = new ClassRefresh(Elements, newGame);

//参数传送：全局变量
let fireI;
let orderI;
let orderFood;

Elements.orderYes.addEventListener('click', orderYesFunction);

//orderYes的监听
function orderYesFunction() {

    //清空checkbox
    for (let i = 0; i < Elements.CheckBox.length; i++) {
        Elements.CheckBox[i].checked = false;
    }

    //隐藏foodMenu
    Elements.foodMenu.style['display'] = 'none';

    //数据处理：参数传送
    for (let i = 0; orderFood.length; i++) {
        newGame.sitting[orderI].food[i] = orderFood[0];
        //计算价格
        newGame.sitting[orderI].price += newGame.sitting[orderI].food[i].price;
        orderFood.shift();
    }

    //数据处理：顾客数值设置
    for (let i = 0; i < 3; i++) {
        //只点了这几个菜
        if (!newGame.sitting[orderI].food[i])
            break;
        //设置顾客的耐心
        let typeIndex = newGame.sitting[orderI].food[i].type;
        newGame.sitting[orderI].patient[i] = newGame.defaultPatient[typeIndex];
    }
    //计时恢复
    newGame.TimeResume()
}

//各元素添加监听
function AddListener(Elements, newGame) {

    //招聘厨师按钮添加监听
    for (let i = 0; i < 6; i++) {
        Elements.addBlock[i].addEventListener("click", function() {

            //计时停止
            newGame.TimeStop();

            //遮罩
            Elements.blackShadow.style['display'] = 'initial';

            //窗口显示
            Elements.recruitWindow.style['display'] = 'flex';
        });
    }

    //解雇厨师按钮添加监听
    for (let i = 0; i < 6; i++) {
        Elements.deleteBlock[i].addEventListener("click", function() {

            //计时停止
            newGame.TimeStop();

            //违约金
            Elements.chefPay.textContent = Math.ceil(newGame.chef[i].weekWorkTime / 7 * newGame.chef[i].salary) + newGame.chef[i].salary;

            //窗口显示
            Elements.fireWindow.style['display'] = 'flex';

            //遮罩
            Elements.blackShadow.style['display'] = 'initial';

            //参数传送：解雇第i个厨师
            fireI = i;
        });
    }

    //确认招聘厨师添加监听
    Elements.recruitYes.addEventListener("click", function() {

        //获取厨师位置
        let i = newGame.chef.length;

        //数据处理：招聘厨师
        newGame.recruitChef();

        //遮罩
        Elements.blackShadow.style['display'] = 'none';

        //该位置招聘按钮隐藏
        Elements.addBlock[i].className = 'block-hidden';

        //该位置厨师头像显示
        Elements.chefImg[i].className = 'chef-img';

        //招聘窗口隐藏
        Elements.recruitWindow.style["display"] = 'none';

        //计时恢复
        newGame.TimeResume();

        //厨师已满
        if (i === 5)
            return true;

        //下一个厨师位置显示
        Elements.chef[i + 1].className = 'div-chef';

        //下一个厨师招聘按钮显示
        Elements.addBlock[i + 1].className = 'add-block';

        return true;
    });

    //取消招聘厨师添加监听
    Elements.recruitNo.addEventListener("click", function() {

        //招聘窗口隐藏
        Elements.recruitWindow.style["display"] = 'none';

        //遮罩
        Elements.blackShadow.style['display'] = 'none';

        //计时恢复
        newGame.TimeResume();

        return true;
    });

    //确认解雇厨师添加监听
    Elements.fireYes.addEventListener("click", function() {

        //获取厨师位置
        let i = fireI;

        //获取厨师数
        let sum = newGame.chef.length;

        //数据处理：解雇厨师
        let flag = newGame.fireChef(i);

        //是否成功
        if (!flag) {
            if (newGame.chef.length === 1) {
                return false;
            } else {
                alert('你的资金不足以支付');
                return false;
            }
        }

        //遮罩
        Elements.blackShadow.style['display'] = 'none';

        //特例：解雇最后一个厨师
        if (i === sum - 1) {

            //隐藏解雇按钮
            Elements.deleteBlock[i].className = 'block-hidden';
            //厨师头像改为投影
            Elements.chefImg.className = 'chef-filter';
            //显示招聘按钮
            Elements.addBlock.className = 'add-block';

            //隐藏下一个厨师圈
            if (i !== 5)
                Elements.chef[i + 1].className = 'block-hidden';

            //解雇窗口隐藏
            Elements.fireWindow.style["display"] = 'none';

            //计时恢复
            newGame.TimeResume();
        }

        //移动各元素
        for (let j = i; j < sum - 1; j++) {

            //厨师圈移动
            Elements.chef[j].className = Elements.chef[j + 1].className;

            //厨师图像移动
            Elements.chefImg[j].className = Elements.chefImg[j + 1].className;

            //招聘/解雇按钮移动
            Elements.addBlock[j].className = Elements.addBlock[j + 1].className;
            Elements.deleteBlock[j].className = Elements.deleteBlock[j + 1].className;

            //bar移动
            Elements.chefBar[j].className = Elements.chefBar[j + 1].className;

            //shadow移动
            Elements.shadowCookBar[j].className = Elements.shadowCookBar[j + 1].className;

            //complete移动
            Elements.divComplete[j].className = Elements.divComplete[j + 1].className;
        }

        //特例：厨师满
        if (sum === 6) {
            //厨师圈
            Elements.chef[5].className = 'div-chef';

            //厨师图像
            Elements.chefImg[5].className = 'chef-filter';

            //招聘/解雇按钮
            Elements.addBlock[5].className = 'add-block';
            Elements.deleteBlock[5].className = 'block-hidden';

            //bar
            Elements.chefBar[5].className = 'block-hidden';

            //shadow移动
            Elements.shadowCookBar[5].className = 'block-hidden';

            //complete移动
            Elements.divComplete[5].className = 'block-hidden';
        }

        //解雇窗口隐藏
        Elements.fireWindow.style["display"] = 'none';

        //计时恢复
        newGame.TimeResume();

        return true;
    });

    //取消解雇厨师添加监听
    Elements.fireNo.addEventListener("click", function() {

        //解雇窗口隐藏
        Elements.fireWindow.style["display"] = 'none';

        //遮罩
        Elements.blackShadow.style['display'] = 'none';

        //计时恢复
        newGame.TimeResume();

        return true;
    });

    //队列区域添加监听
    for (let i = 0; i < 6; i++) {
        Elements.divCustomer[i].addEventListener('click', function() {

            let index = 0;
            for (index = 0; index < newGame.sitting.length; index++) {
                if (newGame.sitting[index] === 0)
                    break;
            }
            //座位满
            if (index === 4)
                return false;

            //更新顾客在菜单上的信息
            Elements.orderName.textContent = newGame.queue[0].name;
            //头像对应
            switch (newGame.queue[0].headPortrait) {
                case 0:
                    { Elements.customerImg[2][0].src = 'restaurant/379448-512.png'; break; }
                case 1:
                    { Elements.customerImg[2][0].src = 'restaurant/379339-512.png'; break; }
                case 2:
                    { Elements.customerImg[2][0].src = 'restaurant/379446-512.png'; break; }
                case 3:
                    { Elements.customerImg[2][0].src = 'restaurant/iconfinder_Boss-3_379348.png'; break; }
                case 4:
                    { Elements.customerImg[2][0].src = 'restaurant/iconfinder_Man-16_379485.png'; break; }
                case 5:
                    { Elements.customerImg[2][0].src = 'restaurant/iconfinder_Rasta_379441.png'; break; }
                case 6:
                    { Elements.customerImg[2][0].src = 'restaurant/379444-512.png'; break; }
                default:
                    break;
            }

            //数据处理：就座点餐
            newGame.sitAndOrder(index);

            //计时停止
            newGame.TimeStop();

            orderI = index;

            //显示菜单
            Elements.foodMenu.style['display'] = 'flex';
        });
    }

    //orderNo监听
    Elements.orderNo.addEventListener('click', function() {

        //清空checkbox
        for (let i = 0; i < Elements.CheckBox.length; i++) {
            Elements.CheckBox[i].checked = false;
        }

        //隐藏foodMenu
        Elements.foodMenu.style['display'] = 'none';

        //数据处理：设置顾客状态
        newGame.sitting[orderI].position = 'out';
        newGame.sitting[orderI] = 0;

        //计时恢复
        newGame.TimeResume();

    })

    //结账添加监听
    for (let i = 0; i < 4; i++) {
        Elements.divCheck[i].addEventListener('click', function() {

            //数据处理：结账
            newGame.checkOut(i);

            //座位清空
            //顾客图像清空
            Elements.customerImg[0][i].className = 'block-hidden';
            //结账按钮隐藏
            Elements.divCheck[i].className = 'block-hidden';
            //bar和barLine清空
            for (let j = 0; j < 3; j++) {
                Elements.customerBar[i][j].className = 'block-hidden';
                Elements.customerBarLine[i][j].className = 'block-hidden';
            }
            //座位颜色清空
            Elements.divSeat[i].className = 'div-seat div-seat-none';

            return true;
        })
    }

    //安抚生气添加监听
    for (let i = 0; i < 4; i++) {
        Elements.divAppease[i].addEventListener('click', function() {

            //数据处理：结账
            newGame.appeaseAngry(i);

            //座位清空
            //顾客图像清空
            Elements.customerImg[0][i].className = 'block-hidden';
            //结账按钮隐藏
            Elements.divCheck[i].className = 'block-hidden';
            //bar和barLine清空
            for (let j = 0; j < 3; j++) {
                Elements.customerBar[i][j].className = 'block-hidden';
                Elements.customerBarLine[i][j].className = 'block-hidden';
            }
            //座位颜色清空
            Elements.divSeat[i].className = 'div-seat div-seat-none';

            return true;
        })
    }

    //上菜添加监听
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 3; j++) {
            Elements.dishUp[i][j].addEventListener('click', function() {

                //数据处理：上菜
                newGame.dishUp(i, j);

                //上菜按钮隐藏
                Elements.dishUp[i][j].className = 'block-hidden';

                //bar变色
                Elements.customerBar[i][j].className = 'customer-bar bar' + j + ' eating-bar';

                //座位圈变色
                Elements.divSeat[i].className = 'div-seat div-seat-eating';

                return true;
            });
        }
    }
}

//全局计时函数
function TimeKeeping(Elements, newGame, Refresh) {

    Refresh.rfMenu();

    if (newGame.TimeFlag) {

        //计时
        newGame.Time++;

        //状态刷新
        Refresh.rfQueue();

        Refresh.rfSeat();

        Refresh.rfChef();


        //更新计时和资金
        newGame.updateData(Elements.WEEK, Elements.DAY, Elements.MONEY);

        //测试用，可以删除
        //Elements.TIMEMS.textContent = newGame.Time;

        //顾客来到餐厅
        newGame.customerComeToRestaurant();

        //清理队列顾客
        newGame.leaveFromQueue();

        //安排做菜
        newGame.chefCookDish();

        //食物做好
        newGame.foodWell();

        //不吃了
        newGame.refuseEat();

        //生气
        newGame.angry();

        //吃完一个菜
        newGame.finishAFood();

        //设置顾客状态
        newGame.setCustomerPosition();

        //清理过期食物
        newGame.throwFood();


        //状态刷新
        Refresh.rfQueue();

        Refresh.rfSeat();

        Refresh.rfChef();

    }
    //一天240s
    if (newGame.Time >= 2400) {
        newGame.Day++;
        newGame.Time = 0;
        //调用每天事件处理函数
        newGame.DayHandling();
    }
    if (newGame.Day > 7) {
        newGame.Week++;
        newGame.Day = 1;
        //调用每周事件处理函数
        newGame.WeekHandling();
    }
}

//由元素值求数组索引
function findIndexByValue(array, value) {
    let length = array.length;
    let i = 0;
    for (i = 0; i < length; i++)
        if (array[i] === value)
            return i;
    return false;
}

//创建厨师对象
function CreateChef() {
    for (let i = 0; i < 6; i++) {
        newGame.allChef.push(new ClassChef());
    }
}

//创建顾客对象
function CreateCustomer() {
    for (let i = 0; i < newGame.names.length; i++) {
        newGame.customer.push(new ClassCustomer(newGame.names[i],
            (Math.floor((Math.random() * 10)) % 7)));
    }
}

//创建食物对象
function CreateFood() {
    let i = 0;

    newGame.allFood.push(new ClassFood(newGame.foodNames[i], 0, 6, 10));
    i++;
    newGame.allFood.push(new ClassFood(newGame.foodNames[i], 0, 4, 9));
    i++;

    newGame.allFood.push(new ClassFood(newGame.foodNames[i], 1, 12, 15));
    i++;
    newGame.allFood.push(new ClassFood(newGame.foodNames[i], 1, 15, 20));
    i++;
    newGame.allFood.push(new ClassFood(newGame.foodNames[i], 1, 18, 21));
    i++;
    newGame.allFood.push(new ClassFood(newGame.foodNames[i], 1, 16, 19));
    i++;
    newGame.allFood.push(new ClassFood(newGame.foodNames[i], 1, 12, 14));
    i++;

    newGame.allFood.push(new ClassFood(newGame.foodNames[i], 2, 5, 10));
    i++;
    newGame.allFood.push(new ClassFood(newGame.foodNames[i], 2, 6, 10));
}

//函数调用，添加监听
AddListener(Elements, newGame);

//初始化元素
for (let i = 0; i < 6; i++) {
    Elements.chef[i].className = 'block-hidden';
    Elements.divCustomer[i].className = 'block-hidden';
}
for (let i = 0; i < 4; i++) {
    Elements.divSeat[i].className = 'block-hidden';
}
for (let i = 0; i < 6; i++) {
    Elements.addBlock[i].className = 'block-hidden';
    Elements.deleteBlock[i].className = 'block-hidden';
}

//开始游戏添加监听
Elements.startGame.addEventListener('click', function() {
    Elements.startWindow.style['display'] = 'none';
    newGame.Initialize();
});

//100ms进行一次计时
setInterval(TimeKeeping, 100, Elements, newGame, Refresh);