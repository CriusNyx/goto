# GOTO
function initialize-goto {
  eval "$(goto-bin --environment-variables bash)"
}

function goto {
  goto-bin $@
  ret=$?
  if [ $ret == 0 ]; then
    result=$(cat /tmp/goto.output)
    if [ -n "$result" ]; then
      cd $result
    else
      initialize-goto
    fi
  fi
}

function gt {
  goto $@
}

function pushto {
  goto-bin $@
  ret=$?
  if [ $ret == 0 ]; then
    result=$(cat /tmp/goto.output)
    if [ -n "$result" ]; then
      pushd $result
    else
      initialize-goto
    fi
  fi
}

function pt {
  pushto $@
}

eval "$(goto-bin --environment-variables bash)"
initialize-goto