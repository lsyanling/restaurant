      //顾客来到餐厅
      customerComeToRestaurant() {

          //事件平均5秒发生一次
          if ((Math.random() * 100) > 100)
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