#!/bin/bash
#
# SPDX-License-Identifier: Apache-2.0
#
echo "Bootstrapping ......."
minifab netup -s couchdb -e true -o seller.blockland.com

sleep 5

echo "Creating channel"
minifab create -c blockchannel

sleep 2

echo "Joining channel"
minifab join -c blockchannel

sleep 2

echo "Anchor Update"
minifab anchorupdate
sleep 2

echo "#### network Setup Complete ###"
echo "Generating Required Materials"

minifab profilegen -c blockchannel
