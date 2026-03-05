# GOTO
function initialize-goto
  # Comment in the following line to enable goto to set environment variables from the goto table.
  # eval "$(goto-bin --environment-variables fish)"
  complete -c goto -a $(goto-bin --completions fish)
  complete -c gt -a $(goto-bin --completions fish)
  complete -c pushto -a $(goto-bin --completions fish)
  complete -c pt -a $(goto-bin --completions fish)
end

function goto
  goto-bin $argv
  if test $status -eq 0
    set result $(cat /tmp/goto.output)
    if test -n "$result"
      cd $result
    else
      initialize-goto
    end
  end
end

function gt
  goto $argv
end

function pushto
  goto-bin $argv
  if test $status -eq 0
    set result $(cat /tmp/goto.output)
    if test -n "$result"
      pushd $result
    else
      initialize-goto
    end
  end
end

function pt
  pushto $argv
end

initialize-goto
