FROM amazon/aws-cli
ARG  UserName=dev

RUN \
  curl --silent --location https://rpm.nodesource.com/setup_16.x | /bin/bash -

RUN \
  set -x && \
  yum -y update && \
  amazon-linux-extras install epel docker && \
  yum install -y gcc shadow-utils iputils parallel sudo procps-ng nodejs inotify-tools python-pip python3-pip wget curl git tar unzip zip zsh yum-utils && \
  yum clean all && \
  rm -rf /var/cache/yum && \
  rm -rf /tmp/*

RUN \
  pip3 install semgrep && \
  rm -rf /var/log/* /tmp/*

RUN \
  npm install -g yarn && \
  rm -rf /var/log/* /tmp/*

RUN curl -o /tmp/sonar.zip https://binaries.sonarsource.com/Distribution/sonar-scanner-cli/sonar-scanner-cli-4.7.0.2747-linux.zip && \
    unzip /tmp/sonar.zip -d /tmp && \
    mv /tmp/sonar-scanner-4.7.0.2747-linux /opt/sonar-scanner && \
    rm -rf /var/log/* /tmp/*

RUN \
  set -x && \
  useradd -s /usr/bin/zsh -m -u 1000 -d /home/${UserName} ${UserName} && \
  echo ${UserName}:${UserName} | chpasswd -m && \
  install -m 755 -o ${UserName} -g ${UserName} -d /${UserName}/home && \
  echo ${UserName}:${UserName} | chpasswd -m && \
  echo "${UserName} ALL=(ALL) NOPASSWD: ALL" > "/etc/sudoers.d/${UserName}" && \
  chmod 0440 "/etc/sudoers.d/${UserName}" && \
  usermod -aG docker ${UserName} && \
  rm -rf /tmp/*

VOLUME [ "/var/run/docker.sock:/var/run/docker.sock" ]

RUN chown -R ${UserName}:${UserName} /home/${UserName}

RUN sudo -u ${UserName} sh -c "yarn global add uglify-js"

ENV PATH="/home/${UserName}/go/bin:/usr/local/go/bin:$PATH"

USER ${UserName}

ENTRYPOINT []
