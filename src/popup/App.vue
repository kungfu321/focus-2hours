<template>
  <div>
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span>FOCUS 2 hours</span>
      </div>
      <div>
        <el-row justify="center" align="middle" type="flex">
          <el-col :span="12">
            <el-button
              :type="play ? 'warning' : 'primary'"
              @click="onPlay"
              :icon="play ? 'el-icon-video-pause' : 'el-icon-video-play'"
            >{{play ? 'STOP' : 'START'}}</el-button>
          </el-col>
          <el-col :span="12">
            <span class="timeRemaining">
              <span v-show="play">
                <strong>{{timeLeft}}</strong> minutes remaining
              </span>
              <span v-show="!play">
                Focus for
                <strong>{{timerDuration}}</strong> minutes
              </span>
            </span>
          </el-col>
        </el-row>
        <el-divider />
        <el-tabs type="border-card">
          <el-tab-pane>
            <span slot="label">
              <i class="el-icon-link"></i> BLOCKED SITES
            </span>
            <div style="margin-top: 15px;">
              <el-input
                placeholder="focus-2hours.me or https://focus-2hours.me"
                v-model="url"
                clearable
                :disabled="play"
                class="input-with-select"
              >
                <el-button
                  slot="append"
                  :disabled="!url || play"
                  icon="el-icon-plus"
                  :loading="loading"
                  @click="onAddNewSite"
                >ADD</el-button>
              </el-input>
            </div>
            <div class="listSite">
              <el-card shadow="hover" v-for="item in listSite" :key="item">
                <el-row type="flex" class="row-bg" justify="center" align="middle">
                  <el-col :span="4">
                    <el-avatar :src="avatarICO(item)" size="small"></el-avatar>
                  </el-col>
                  <el-col :span="14">
                    <span class="domain">{{item}}</span>
                  </el-col>
                  <el-col :span="6">
                    <el-button
                      type="danger"
                      icon="el-icon-delete"
                      :disabled="play"
                      plain
                      @click="onRemoveSite(item)"
                    >REMOVE</el-button>
                  </el-col>
                </el-row>
              </el-card>
            </div>
          </el-tab-pane>
          <el-tab-pane>
            <span slot="label">
              <i class="el-icon-s-tools"></i> SETTINGS
            </span>
            <div class="setting">
              <div>
                <span>Start timer on icon click</span>
                <el-switch v-model="startonClick" class="startonClick"></el-switch>
              </div>

              <div class="audioPlay">
                <span>Play audio when done!</span>
                <el-switch v-model="audioPlay" class="startonClick"></el-switch>
              </div>

              <el-row justify="center" align="middle" class="timerDuration" type="flex">
                <el-col :span="16">
                  <span>Work duration (minutes)</span>
                </el-col>
                <el-col :span="8" :offset="2">
                  <el-input-number
                    v-model="timerDuration"
                    controls-position="right"
                    :min="2"
                    :max="1000"
                  ></el-input-number>
                </el-col>
              </el-row>

              <el-row justify="center" align="middle" type="flex">
                <el-col :span="16">
                  <span>Relax duration (minutes)</span>
                </el-col>
                <el-col :span="8">
                  <el-input-number
                    v-model="unblockDuration"
                    controls-position="right"
                    :min="2"
                    :max="1000"
                  ></el-input-number>
                </el-col>
              </el-row>

              <el-button
                type="success"
                class="saveChange"
                @click="onSaveSettings"
                :disabled="play"
              >Save change</el-button>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </el-card>
  </div>
</template>

<script>
export default {
  created() {
    // const thisTmp = this;
    const blockList = JSON.parse(localStorage.getItem("blockList"));
    const settings = JSON.parse(localStorage.getItem("settings"));
    this.play = JSON.parse(localStorage.getItem("play"));
    const endTime = JSON.parse(localStorage.getItem("endTime123"));

    if (blockList) {
      this.listSite = blockList;
    }
    if (settings) {
      this.startonClick = settings.startonClick;
      this.audioPlay = settings.audioPlay;
      this.timerDuration = settings.timerDuration;
      this.unblockDuration = settings.unblockDuration;

      if (endTime) {
        const timeLeft = (Number(endTime) - new Date().getTime()) / (1000 * 60);
        this.timeLeft = parseInt(timeLeft);
        this.timer = setInterval(() => this.timeLeft--, 1000 * 60);
      } else {
        this.timeLeft = settings.timerDuration;
      }

      // click to start
      console.log(settings.startonClick, this.play);
      if (settings.startonClick && !this.play) {
        console.log("startonClick");
        this.onPlay();
      }
    }
  },
  data() {
    return {
      play: false,
      url: null,
      startonClick: true,
      audioPlay: true,
      timerDuration: 120,
      unblockDuration: 15,
      loading: false,
      listSite: [],
      timeLeft: null,
      timer: null,
    };
  },
  computed: {
    avatarICO: function () {
      return (domain) => `http://www.google.com/s2/favicons?domain=${domain}`;
    },
  },
  methods: {
    onPlay: function () {
      if (!this.play) {
        this.timeLeft = this.timerDuration;
        this.setEndTime();
        this.timer = setInterval(() => this.timeLeft--, 1000 * 60);
        chrome.runtime.sendMessage({
          command: "startTimer",
        });
      } else {
        clearInterval(this.timer);
        this.timer = null;
        chrome.runtime.sendMessage({
          command: "stopTimer",
        });
      }
      localStorage.setItem("play", !this.play);
      this.play = !this.play;
    },
    onAddNewSite: function () {
      let data = this.listSite;
      data.push(this.url);
      const dataJson = JSON.stringify(data);
      const thisTmp = this;

      localStorage.setItem("blockList", dataJson);
      thisTmp.listSite = data;
      thisTmp.url = "";
      this.showMessage("Save successful");
    },
    onRemoveSite: function (domain) {
      let blockList = this.listSite;
      const idx = blockList.indexOf(domain);

      if (idx > -1) {
        blockList.splice(idx, 1);
        const thisTmp = this;
        const dataJson = JSON.stringify(blockList);
        localStorage.setItem("blockList", dataJson);
        this.showMessage("Save change successful");
      }
    },
    onSaveSettings: function () {
      const thisTmp = this;
      const dataJson = JSON.stringify({
        startonClick: this.startonClick,
        audioPlay: this.audioPlay,
        timerDuration: this.timerDuration,
        unblockDuration: this.unblockDuration,
      });

      localStorage.setItem("settings", dataJson);
      this.showMessage("Save change successful");
    },
    calculateTimeLeft: function () {
      console.log("OK");
    },
    setEndTime: function () {
      const now = new Date().getTime();
      const endTime = now + this.timerDuration * 60 * 1000;
      localStorage.setItem("endTime123", endTime);
    },
    showMessage: function (message) {
      this.$message({
        message,
        type: "success",
      });
    },
  },
  watch: {
    timeLeft(value) {
      if (value <= 0 && this.play) {
        console.log("watch timeLeft", value, this.play);
        this.onPlay();

        chrome.notifications.clear("notify1");
        const opt = {
          iconUrl: "../icons/congrats48.png",
          type: "basic",
          title: "Congratulations!",
          message: "You made it! Take a break...",
        };
        chrome.notifications.create("notify1", opt, function () {
          console.log("created notifications!");
        });
        if (this.audioPlay) {
          const audio = new Audio("../audio/notification.mp3");
          audio.play();
        }
      }
    },
    endTime(value) {
      console.log("endTime", value);
    },
    timerDuration(value) {
      this.timeLeft = value;
    },
  },
};
</script>

<style lang="scss">
body {
  min-width: 600px;
}
p {
  font-size: 20px;
}
.listSite {
  margin-top: 16px;

  .domain {
    font-size: 16px;
    font-weight: bold;
  }
}

.timeRemaining {
  font-size: 16px;
}

.setting {
  span {
    font-size: 14px;
  }
  .startonClick {
    float: right;
  }
  .timerDuration {
    margin-top: 16px;
    margin-bottom: 16px;
  }
  .saveChange {
    margin-top: 30px;
    float: right;
  }
  .audioPlay {
    margin-top: 16px;
  }
}
</style>
