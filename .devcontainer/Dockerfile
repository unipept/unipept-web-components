#-------------------------------------------------------------------------------------------------------------
# Copyright (c) Microsoft Corporation. All rights reserved.
# Licensed under the MIT License. See https://go.microsoft.com/fwlink/?linkid=2090316 for license information.
#-------------------------------------------------------------------------------------------------------------

FROM ubuntu:18.04

# Avoid warnings by switching to noninteractive
ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get -y install git nodejs npm 
RUN npm install -g @vue/cli

# Switch back to dialog for any ad-hoc use of apt-get
ENV DEBIAN_FRONTEND=
