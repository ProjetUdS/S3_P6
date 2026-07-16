package ca.usherbrooke.fgen.api.business;

// import io.quarkus.runtime.annotations.RegisterForReflection;

import java.util.Date;
import java.util.List;

// @RegisterForReflection
public class Message {

  public String id;
  public Date date;
  public String contenu;
  public String cip;
  public String discussionId;
  public String destinataireCip;

  public List<FichierJoint> fichiers;
}
